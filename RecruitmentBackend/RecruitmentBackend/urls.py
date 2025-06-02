from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # # các api app
    path('', include('AuthApp.urls')),
    path('', include('JobApp.urls')),
    path('', include('ResumeApp.urls')),
    # path('api/profile/', include('ProfileApp.urls')),
    path('', include('ApplicationApp.urls')),
    # path('api/chat/', include('ChatApp.urls')),
    # path('', include('NotificationApp.urls')),
    path('', include('ReportApp.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)