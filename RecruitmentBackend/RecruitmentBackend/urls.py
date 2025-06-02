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