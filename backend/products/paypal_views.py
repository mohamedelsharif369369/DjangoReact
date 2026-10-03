import base64
import os

import requests

from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from .models import Order


def paypal_base_url():
    environment = os.getenv(
        "PAYPAL_ENVIRONMENT",
        "sandbox",
    ).lower()

    if environment == "live":
        return "https://api-m.paypal.com"

    return "https://api-m.sandbox.paypal.com"


def get_paypal_access_token():
    client_id = os.getenv("PAYPAL_CLIENT_ID", "").strip()
    client_secret = os.getenv(
        "PAYPAL_CLIENT_SECRET",
        "",
    ).strip()

    if not client_id or not client_secret:
        raise ValueError(
            "PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET is missing"
        )

    credentials = f"{client_id}:{client_secret}"

    encoded_credentials = base64.b64encode(
        credentials.encode()
    ).decode()

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
                "error": "Order total must be greater than zero"
            },
            status=400,
        )

    try:
        access_token = get_paypal_access_token()

        payload = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": str(order.id),
                    "description": (
                        f"Order #{order.id}"
                    ),
                    "custom_id": str(order.id),
                    "amount": {
                        "currency_code": "USD",
                        "value": f"{order.total:.2f}",
                    },
                }
            ],
        }

        response = requests.post(
            f"{paypal_base_url()}/v2/checkout/orders",
            headers={
                "Content-Type": "application/json",
                "Authorization": (
                    f"Bearer {access_token}"
                ),
                "Prefer": "return=representation",
            },
            json=payload,
            timeout=30,
        )

        data = response.json()

        if not response.ok:
            return JsonResponse(
                {
                    "error": "PayPal order creation failed",
                    "details": data,
                },
                status=response.status_code,
            )

        paypal_order_id = data.get("id")

        order.payment_method = "paypal"
        order.payment_status = "pending"
        order.paypal_order_id = paypal_order_id
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
                "status": data.get("status"),
                "order_id": order.id,
                "amount": f"{order.total:.2f}",
                "currency": "USD",
            }
        )

    except requests.RequestException as exc:
        return JsonResponse(
            {
                "error": "Could not connect to PayPal",
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
    order_id = request.data.get("order_id")
    paypal_order_id = request.data.get(
        "paypal_order_id"
    )

    if not order_id or not paypal_order_id:
        return JsonResponse(
            {
                "error": (
                    "order_id and paypal_order_id "
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
                "message": "Order is already paid",
            }
        )

    if (
        order.paypal_order_id
        and order.paypal_order_id != paypal_order_id
    ):
        return JsonResponse(
            {
                "error": "PayPal order does not match"
            },
            status=400,
        )

    try:
        access_token = get_paypal_access_token()

        response = requests.post(
            (
                f"{paypal_base_url()}"
                f"/v2/checkout/orders/"
                f"{paypal_order_id}/capture"
            ),
            headers={
                "Content-Type": "application/json",
                "Authorization": (
                    f"Bearer {access_token}"
                ),
                "Prefer": "return=representation",
            },
            json={},
            timeout=30,
        )

        data = response.json()

        if not response.ok:
            order.payment_status = "failed"
            order.save(
                update_fields=["payment_status"]
            )

            return JsonResponse(
                {
                    "error": "PayPal capture failed",
                    "details": data,
                },
                status=response.status_code,
            )

        paypal_status = data.get("status")

        if paypal_status != "COMPLETED":
            return JsonResponse(
                {
                    "success": False,
                    "status": paypal_status,
                    "details": data,
                },
                status=400,
            )

        capture_id = ""

        purchase_units = data.get(
            "purchase_units",
            [],
        )

        if purchase_units:
            payments = purchase_units[0].get(
                "payments",
                {},
            )

            captures = payments.get(
                "captures",
                [],
            )

            if captures:
                capture_id = captures[0].get(
                    "id",
                    "",
                )

        order.payment_method = "paypal"
        order.payment_status = "paid"
        order.paypal_order_id = paypal_order_id
        order.paypal_capture_id = capture_id
        order.paid_at = timezone.now()

        order.save(
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
                "paypal_order_id": paypal_order_id,
                "paypal_capture_id": capture_id,
            }
        )

    except requests.RequestException as exc:
        return JsonResponse(
            {
                "error": "Could not connect to PayPal",
                "details": str(exc),
            },
            status=502,
        )

    except Exception as exc:
        return JsonResponse(
            {
                "error": "PayPal capture error",
                "details": str(exc),
            },
            status=500,
        )
