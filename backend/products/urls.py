from django.urls import path

from .views import (
    CategoryListCreateView,
    CurrentUserView,
    MyOrdersView,
    OrderCreateView,
    ProductDetailView,
    ProductListCreateView,
    RegisterView,
)


urlpatterns = [
    path(
        "products/",
        ProductListCreateView.as_view(),
        name="product-list-create",
    ),

    path(
        "products/<int:pk>/",
        ProductDetailView.as_view(),
        name="product-detail",
    ),

    path(
        "categories/",
        CategoryListCreateView.as_view(),
        name="category-list-create",
    ),

    path(
        "me/",
        CurrentUserView.as_view(),
        name="current-user",
    ),

    path(
        "orders/",
        OrderCreateView.as_view(),
        name="order-create",
    ),

    path(
        "my-orders/",
        MyOrdersView.as_view(),
        name="my-orders",
    ),

    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),
]
