"""
ASGI config for DjangoAPI project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

# asgi.py
import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from django.urls import path
from ..RecruitmentApp import consumers

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'DjangoAPI.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path('ws/chat/<str:conversation_id>/', consumers.ChatConsumer.as_asgi()),
        ])
    ),
})

