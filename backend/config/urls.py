from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from django.http import JsonResponse

from cloudinary.utils import api_sign_request

from django.conf import settings


def cloudinary_test(request):
    try:
        params = {
            "folder": "media/products",
            "tags": "media",
            "timestamp": 1791036437,
            "use_filename": 1,
        }

        signature = api_sign_request(
            params,
            settings.CLOUDINARY_API_SECRET,
        )

        return JsonResponse({
            "success": True,
            "cloud_name": settings.CLOUDINARY_CLOUD_NAME,
            "api_key_last_4": settings.CLOUDINARY_API_KEY[-4:],
            "secret_length": len(
                settings.CLOUDINARY_API_SECRET
            ),
            "generated_signature": signature,
        })

    except Exception as e:
        return JsonResponse({
            "success": False,
            "error_type": type(e).__name__,
            "error": str(e),
        }, status=500)


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
        "api/cloudinary-test/",
        cloudinary_test,
        name="cloudinary_test",
    ),
]
