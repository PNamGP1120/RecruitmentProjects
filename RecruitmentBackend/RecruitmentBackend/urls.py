from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # # các api app
    # path('api/auth/', include('AuthApp.urls')),
    # path('api/jobs/', include('JobApp.urls')),
    # path('api/profile/', include('ProfileApp.urls')),
    # path('api/application/', include('ApplicationApp.urls')),
    # path('api/chat/', include('ChatApp.urls')),
    # path('api/notification/', include('NotificationApp.urls')),
    # path('api/report/', include('ReportApp.urls')),
]
