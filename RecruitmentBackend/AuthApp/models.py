import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from cloudinary.models import CloudinaryField


class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Role(BaseModel):
    JOB_SEEKER = 'JobSeeker'
    RECRUITER = 'Recruiter'
    ADMIN = 'Admin'

    ROLE_CHOICES = [
        (JOB_SEEKER, 'Người tìm việc'),
        (RECRUITER, 'Nhà tuyển dụng'),
        (ADMIN, 'Quản trị viên'),
    ]

    name = models.CharField(max_length=50, unique=True, choices=ROLE_CHOICES)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.get_name_display()

    class Meta:
        verbose_name = "Vai trò"
        verbose_name_plural = "Các vai trò"
        ordering = ['name']


class MyUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    avatar = CloudinaryField(null=True, blank=True, folder='avatars')
    roles = models.ManyToManyField(Role, through='UserRole', through_fields=('user', 'role'), related_name='users')
    active_role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, related_name='active_users')
    is_verified = models.BooleanField(default=False, help_text="Email đã xác thực")
    is_active = models.BooleanField(default=True, help_text="Tài khoản hoạt động")
    last_password_change = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.username or "User has no username"

    @property
    def avatar_url(self):
        if self.avatar:
            return self.avatar.url
        return settings.STATIC_URL + 'images/default_avatar.png'

    class Meta:
        verbose_name = "Người dùng"
        verbose_name_plural = "Người dùng"
        ordering = ['username']


class UserRole(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_roles')
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='role_users')
    is_approved = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
                                    related_name='approved_roles')

    class Meta:
        unique_together = ('user', 'role')
        verbose_name = "Vai trò người dùng"
        verbose_name_plural = "Các vai trò người dùng"
        ordering = ['user__username']

    def __str__(self):
        status = '(Đã phê duyệt)' if self.is_approved else '(Chưa duyệt)'
        return f"{self.user.username} - {self.role.name} {status}"
