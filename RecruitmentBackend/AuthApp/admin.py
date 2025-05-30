from django.contrib import admin
from .models import MyUser, UserRole, Role

admin.site.register(MyUser)
admin.site.register(UserRole)
admin.site.register(Role)
