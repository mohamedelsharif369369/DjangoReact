from django.contrib import admin
from django.urls import include, path

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from products.paypal_views import (
    create_paypal_order,
    capture_paypal_order,
)


urlpatterns = [
    path("admin/", admin.site.urls),

    path(
        "api/",
        include("products.urls"),
    ),

    path(
        "api/token/",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),

    path(
        "api/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),

    path(
        "api/payments/paypal/create/",
        create_paypal_order,
        name="paypal_create_order",
    ),

    path(
        "api/payments/paypal/capture/",
        capture_paypal_order,
        name="paypal_capture_order",
    ),
]
