import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone

class Notification(models.Model):
    """
    Thông báo gửi đến người dùng.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    # Nếu cần loại thông báo (ví dụ: việc làm mới, trạng thái hồ sơ, nhắc lịch phỏng vấn)
    NOTIFICATION_TYPES = [
        ('job', 'Việc làm mới'),
        ('application', 'Trạng thái hồ sơ'),
        ('interview', 'Nhắc lịch phỏng vấn'),
        ('general', 'Thông báo chung'),
    ]
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='general')
    # Liên kết đến đối tượng liên quan (nếu có)
    related_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"Notification to {self.recipient.username} - {self.title}"

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Thông báo"
        verbose_name_plural = "Các thông báo"
