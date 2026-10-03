import base64
import os
from decimal import Decimal

import requests

from django.db import transaction
from django.http import JsonResponse
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from .models import Order


# Sandbox testing rate:
# 1 USD = 7 LYD
LYD_PER_USD = Decimal("7.00")


def paypal_base_url():
    environment = os.getenv(
        "PAYPAL_ENVIRONMENT",
        "sandbox",
    ).lower()

    if environment == "live":
        return "https://api-m.paypal.com"

    return "https://api-m.sandbox.paypal.com"


def lyd_to_usd(amount_lyd):
    return (
        Decimal(str(amount_lyd))
        / LYD_PER_USD
    ).quantize(
        Decimal("0.01")
    )


def get_paypal_access_token():
    client_id = os.getenv(
        "PAYPAL_CLIENT_ID",
        "",
    ).strip()

    client_secret = os.getenv(
        "PAYPAL_CLIENT_SECRET",
        "",
    ).strip()

    if not client_id or not client_secret:
        raise ValueError(
            "PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET is missing"
        )

    credentials = (
        f"{client_id}:{client_secret}"
    )

    encoded_credentials = (
        base64.b64encode(
            credentials.encode()
        ).decode()
    )

    response = requests.post(
        f"{paypal_base_url()}/v1/oauth2/token",
        headers={
            "Accept": "application/json",
            "Accept-Language": "en_US",
            "Authorization": (
                f"Basic {encoded_credentials}"
            ),
            "Content-Type": (
                "application/x-www-form-urlencoded"
            ),
        },
        data={
            "grant_type": "client_credentials",
        },
        timeout=30,
    )

    response.raise_for_status()

    return response.json()["access_token"]


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_paypal_order(request):
    order_id = request.data.get("order_id")

    if not order_id:
        return JsonResponse(
            {
                "error": "order_id is required"
            },
            status=400,
        )

    try:
        order = Order.objects.get(
            id=order_id,
            user=request.user,
        )
    except Order.DoesNotExist:
        return JsonResponse(
            {
                "error": "Order not found"
            },
            status=404,
        )

    if order.payment_status == "paid":
        return JsonResponse(
            {
                "error": "Order is already paid"
            },
            status=400,
        )

    if order.total <= 0:
        return JsonResponse(
            {
                "error": (
                    "Order total must be greater "
                    "than zero"
                )
            },
            status=400,
        )

    amount_usd = lyd_to_usd(
        order.total
    )

    if amount_usd <= 0:
        return JsonResponse(
            {
                "error": (
                    "Converted PayPal amount "
                    "must be greater than zero"
                )
            },
            status=400,
        )

    try:
        access_token = (
            get_paypal_access_token()
        )

        payload = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": str(
                        order.id
                    ),
                    "description": (
                        f"Order #{order.id}"
                    ),
                    "custom_id": str(
                        order.id
                    ),
                    "amount": {
                        "currency_code": "USD",
                        "value": (
                            f"{amount_usd:.2f}"
                        ),
                    },
                }
            ],
        }

        response = requests.post(
            (
                f"{paypal_base_url()}"
                "/v2/checkout/orders"
            ),
            headers={
                "Content-Type": (
                    "application/json"
                ),
                "Authorization": (
                    f"Bearer {access_token}"
                ),
                "Prefer": (
                    "return=representation"
                ),
            },
            json=payload,
            timeout=30,
        )

        data = response.json()

        if not response.ok:
            return JsonResponse(
                {
                    "error": (
                        "PayPal order creation "
                        "failed"
                    ),
                    "details": data,
                },
                status=response.status_code,
            )

        paypal_order_id = data.get("id")

        if not paypal_order_id:
            return JsonResponse(
                {
                    "error": (
                        "PayPal did not return "
                        "an order ID"
                    ),
                    "details": data,
                },
                status=502,
            )

        order.payment_method = "paypal"
        order.payment_status = "pending"
        order.paypal_order_id = (
            paypal_order_id
        )

        order.save(
            update_fields=[
                "payment_method",
                "payment_status",
                "paypal_order_id",
            ]
        )

        return JsonResponse(
            {
                "id": paypal_order_id,
                "status": data.get(
                    "status"
                ),
                "order_id": order.id,
                "amount_lyd": (
                    f"{order.total:.2f}"
                ),
                "amount_usd": (
                    f"{amount_usd:.2f}"
                ),
                "currency": "USD",
                "exchange_rate": (
                    "1 USD = 7 LYD"
                ),
            }
        )

    except requests.RequestException as exc:
        return JsonResponse(
            {
                "error": (
                    "Could not connect "
                    "to PayPal"
                ),
                "details": str(exc),
            },
            status=502,
        )

    except Exception as exc:
        return JsonResponse(
            {
                "error": "PayPal error",
                "details": str(exc),
            },
            status=500,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def capture_paypal_order(request):
    order_id = request.data.get(
        "order_id"
    )

    paypal_order_id = request.data.get(
        "paypal_order_id"
    )

    if not order_id or not paypal_order_id:
        return JsonResponse(
            {
                "error": (
                    "order_id and "
                    "paypal_order_id "
                    "are required"
                )
            },
            status=400,
        )

    try:
        order = Order.objects.get(
            id=order_id,
            user=request.user,
        )
    except Order.DoesNotExist:
        return JsonResponse(
            {
                "error": "Order not found"
            },
            status=404,
        )

    if order.payment_status == "paid":
        return JsonResponse(
            {
                "success": True,
                "status": "paid",
                "message": (
                    "Order is already paid"
                ),
            }
        )

    if (
        order.paypal_order_id
        and order.paypal_order_id
        != paypal_order_id
    ):
        return JsonResponse(
            {
                "error": (
                    "PayPal order does "
                    "not match"
                )
            },
            status=400,
        )

    expected_amount_usd = lyd_to_usd(
        order.total
    )

    try:
        access_token = (
            get_paypal_access_token()
        )

        response = requests.post(
            (
                f"{paypal_base_url()}"
                f"/v2/checkout/orders/"
                f"{paypal_order_id}/capture"
            ),
            headers={
                "Content-Type": (
                    "application/json"
                ),
                "Authorization": (
                    f"Bearer {access_token}"
                ),
                "Prefer": (
                    "return=representation"
                ),
            },
            json={},
            timeout=30,
        )

        data = response.json()

        if not response.ok:
            order.payment_status = "failed"

            order.save(
                update_fields=[
                    "payment_status"
                ]
            )

            return JsonResponse(
                {
                    "error": (
                        "PayPal capture "
                        "failed"
                    ),
                    "details": data,
                },
                status=response.status_code,
            )

        paypal_status = data.get(
            "status"
        )

        if paypal_status != "COMPLETED":
            return JsonResponse(
                {
                    "success": False,
                    "status": paypal_status,
                    "details": data,
                },
                status=400,
            )

        purchase_units = data.get(
            "purchase_units",
            [],
        )

        if not purchase_units:
            order.payment_status = "failed"

            order.save(
                update_fields=[
                    "payment_status"
                ]
            )

            return JsonResponse(
                {
                    "error": (
                        "PayPal response "
                        "contains no purchase "
                        "units"
                    )
                },
                status=502,
            )

        purchase_unit = purchase_units[0]

        payments = purchase_unit.get(
            "payments",
            {}
        )

        captures = payments.get(
            "captures",
            []
        )

        if not captures:
            order.payment_status = "failed"

            order.save(
                update_fields=[
                    "payment_status"
                ]
            )

            return JsonResponse(
                {
                    "error": (
                        "PayPal response "
                        "contains no capture"
                    )
                },
                status=502,
            )

        capture = captures[0]

        capture_id = capture.get(
            "id",
            ""
        )

        capture_amount = (
            capture
            .get("amount", {})
            .get("value")
        )

        capture_currency = (
            capture
            .get("amount", {})
            .get("currency_code")
        )

        if capture_currency != "USD":
            order.payment_status = "failed"

            order.save(
                update_fields=[
                    "payment_status"
                ]
            )

            return JsonResponse(
                {
                    "error": (
                        "PayPal currency "
                        "does not match"
                    ),
                    "expected": "USD",
                    "received": (
                        capture_currency
                    ),
                },
                status=400,
            )

        if (
            not capture_amount
            or Decimal(capture_amount)
            != expected_amount_usd
        ):
            order.payment_status = "failed"

            order.save(
                update_fields=[
                    "payment_status"
                ]
            )

            return JsonResponse(
                {
                    "error": (
                        "PayPal amount does "
                        "not match order total"
                    ),
                    "expected": (
                        f"{expected_amount_usd:.2f}"
                    ),
                    "received": (
                        capture_amount
                    ),
                },
                status=400,
            )

        with transaction.atomic():
            locked_order = (
                Order.objects
                .select_for_update()
                .get(
                    id=order.id,
                    user=request.user,
                )
            )

            if (
                locked_order.payment_status
                == "paid"
            ):
                return JsonResponse(
                    {
                        "success": True,
                        "status": "paid",
                        "message": (
                            "Order is already paid"
                        ),
                    }
                )

            order_items = (
                locked_order
                .items
                .select_related("product")
            )

            for item in order_items:
                product = (
                    item.product
                )

                if product.stock < item.quantity:
                    locked_order.payment_status = (
                        "failed"
                    )

                    locked_order.save(
                        update_fields=[
                            "payment_status"
                        ]
                    )

                    return JsonResponse(
                        {
                            "error": (
                                "Not enough stock "
                                f"for {product.name}"
                            )
                        },
                        status=400,
                    )

            for item in order_items:
                product = item.product

                product.stock -= (
                    item.quantity
                )

                product.save(
                    update_fields=["stock"]
                )

            locked_order.payment_method = (
                "paypal"
            )

            locked_order.payment_status = (
                "paid"
            )

            locked_order.paypal_order_id = (
                paypal_order_id
            )

            locked_order.paypal_capture_id = (
                capture_id
            )

            locked_order.paid_at = (
                timezone.now()
            )

            locked_order.save(
                update_fields=[
                    "payment_method",
                    "payment_status",
                    "paypal_order_id",
                    "paypal_capture_id",
                    "paid_at",
                ]
            )

        return JsonResponse(
            {
                "success": True,
                "status": "paid",
                "order_id": order.id,
                "paypal_order_id": (
                    paypal_order_id
                ),
                "paypal_capture_id": (
                    capture_id
                ),
                "amount_lyd": (
                    f"{order.total:.2f}"
                ),
                "amount_usd": (
                    f"{expected_amount_usd:.2f}"
                ),
            }
        )

    except requests.RequestException as exc:
        return JsonResponse(
            {
                "error": (
                    "Could not connect "
                    "to PayPal"
                ),
                "details": str(exc),
            },
            status=502,
        )

    except Exception as exc:
        return JsonResponse(
            {
                "error": (
                    "PayPal capture error"
                ),
                "details": str(exc),
            },
            status=500,
        )
