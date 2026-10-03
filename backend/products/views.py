from decimal import Decimal
import logging

from django.db import transaction
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order, OrderItem, Product
from .permissions import IsOwnerOrAdmin
from .serializers import (
    OrderSerializer,
    ProductSerializer,
    RegisterSerializer,
)


logger = logging.getLogger(__name__)


class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_authenticators(self):
        if self.request.method == "GET":
            return []

        return super().get_authenticators()

    def get_permissions(self):
        if self.request.method == "GET":
            return []

        return [IsAuthenticated()]

    def perform_create(self, serializer):
        try:
            serializer.save(
                owner=self.request.user
            )
        except Exception:
            logger.exception(
                "ERROR while creating product"
            )
            raise


class ProductDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsOwnerOrAdmin]

    def get_authenticators(self):
        if self.request.method == "GET":
            return []

        return super().get_authenticators()


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "is_staff": request.user.is_staff,
        })


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(
            data=request.data
        )

        if serializer.is_valid():
            user = serializer.save()

            return Response(
                {
                    "message": "Account created successfully",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                    },
                },
                status=201,
            )

        return Response(
            serializer.errors,
            status=400,
        )


class OrderCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        customer_name = request.data.get(
            "customer_name"
        )

        phone = request.data.get("phone")

        address = request.data.get("address")

        notes = request.data.get(
            "notes",
            ""
        )

        items = request.data.get(
            "items",
            []
        )

        if not customer_name:
            return Response(
                {
                    "error":
                    "customer_name is required"
                },
                status=400,
            )

        if not phone:
            return Response(
                {
                    "error":
                    "phone is required"
                },
                status=400,
            )

        if not address:
            return Response(
                {
                    "error":
                    "address is required"
                },
                status=400,
            )

        if not items:
            return Response(
                {
                    "error":
                    "items are required"
                },
                status=400,
            )

        order = Order.objects.create(
            user=request.user,
            customer_name=customer_name,
            phone=phone,
            address=address,
            notes=notes,
            total=Decimal("0.00"),
        )

        total = Decimal("0.00")

        for item in items:
            product_id = item.get("product")
            quantity = item.get("quantity")

            if not product_id or not quantity:
                transaction.set_rollback(True)

                return Response(
                    {
                        "error":
                        "Invalid product or quantity"
                    },
                    status=400,
                )

            try:
                quantity = int(quantity)

            except (
                TypeError,
                ValueError
            ):
                transaction.set_rollback(True)

                return Response(
                    {
                        "error":
                        "Quantity must be a number"
                    },
                    status=400,
                )

            if quantity <= 0:
                transaction.set_rollback(True)

                return Response(
                    {
                        "error":
                        "Quantity must be greater than zero"
                    },
                    status=400,
                )

            try:
                product = (
                    Product.objects
                    .select_for_update()
                    .get(id=product_id)
                )

            except Product.DoesNotExist:
                transaction.set_rollback(True)

                return Response(
                    {
                        "error":
                        f"Product {product_id} not found"
                    },
                    status=404,
                )

            if product.stock < quantity:
                transaction.set_rollback(True)

                return Response(
                    {
                        "error":
                        f"Not enough stock for {product.name}. "
                        f"Available: {product.stock}"
                    },
                    status=400,
                )

            item_price = product.price

            item_total = (
                item_price * quantity
            )

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=item_price,
            )

            product.stock -= quantity

            product.save(
                update_fields=["stock"]
            )

            total += item_total

        order.total = total

        order.save(
            update_fields=["total"]
        )

        return Response(
            OrderSerializer(order).data,
            status=201,
        )


class MyOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = (
            Order.objects
            .filter(user=request.user)
            .prefetch_related(
                "items__product"
            )
            .order_by("-created_at")
        )

        serializer = OrderSerializer(
            orders,
            many=True
        )

        return Response(
            serializer.data
        )
