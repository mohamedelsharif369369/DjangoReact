from rest_framework import serializers

from .models import Order, OrderItem, Product


class ProductSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(
        source="owner.username"
    )

    owner_id = serializers.ReadOnlyField(
        source="owner.id"
    )

    image = serializers.ImageField(
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Product
        fields = "__all__"


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(
        source="product.name"
    )

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "quantity",
            "price",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Order

        fields = [
            "id",
            "user",
            "customer_name",
            "phone",
            "address",
            "notes",
            "total",
            "status",
            "created_at",
            "items",
        ]

        read_only_fields = [
            "id",
            "user",
            "total",
            "status",
            "created_at",
            "items",
        ]


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(
        max_length=150
    )

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    def validate_username(self, value):
        from django.contrib.auth.models import User

        if User.objects.filter(
            username=value
        ).exists():
            raise serializers.ValidationError(
                "Username already exists"
            )

        return value

    def create(self, validated_data):
        from django.contrib.auth.models import User

        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
        )

        return user
