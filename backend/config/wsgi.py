"""
WSGI config for config project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.1/howto/deployment/wsgi/
"""

import os
import subprocess
import sys

from django.core.wsgi import get_wsgi_application


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")


if os.getenv("RENDER"):
    subprocess.run(
        [sys.executable, "manage.py", "migrate", "--noinput"],
        check=True,
    )


application = get_wsgi_application()
