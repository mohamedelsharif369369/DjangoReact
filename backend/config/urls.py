from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from django.http import JsonResponse
import os


def cloudinary_debug(request):
    return JsonResponse({
        "cloudinary_cloud_name_exists": bool(
            os.getenv("CLOUDINARY_CLOUD_NAME")
        ),
        "cloudinary_api_key_exists": bool(
            os.getenv("CLOUDINARY_API_KEY")
        ),
        "cloudinary_api_secret_exists": bool(
            os.getenv("CLOUDINARY_API_SECRET")
        ),
        "cloudinary_url_exists": bool(
            os.getenv("CLOUDINARY_URL")
        ),
        "settings_cloud_name_exists": bool(
            getattr(settings, "CLOUDINARY_STORAGE", {}).get(
                "CLOUD_NAME"
            )
        ),
        "settings_api_key_exists": bool(
            getattr(settings, "CLOUDINARY_STORAGE", {}).get(
                "API_KEY"
            )
        ),
        "settings_api_secret_exists": bool(
            getattr(settings, "CLOUDINARY_STORAGE", {}).get(
                "API_SECRET"
            )
        ),
    })


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
        "api/cloudinary-debug/",
        cloudinary_debug,
        name="cloudinary_debug",
    ),
]


if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )
