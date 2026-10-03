from django.contrib import admin

from .models import (
    Category,
    Order,
    OrderItem,
    Product,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "slug",
        "created_at",
    )
    search_fields = (
        "name",
        "slug",
    )
    ordering = (
        "name",
    )


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "category",
        "price",
        "stock",
        "owner",
        "created_at",
        "updated_at",
    )
    search_fields = (
        "name",
        "description",
    )
    list_filter = (
        "category",
        "created_at",
        "updated_at",
    )
    ordering = (
        "-created_at",
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer_name",
        "phone",
        "total",
        "status",
        "created_at",
    )
    search_fields = (
        "customer_name",
        "phone",
        "address",
    )
    list_filter = (
        "status",
        "created_at",
    )
    ordering = (
        "-created_at",
    )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order",
        "product",
        "quantity",
        "price",
    )
    search_fields = (
        "product__name",
    )
