from django.db import models
from django.conf import settings
import uuid

class ActivityLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activity_logs')
    action = models.CharField(max_length=255)
    target = models.CharField(max_length=255, blank=True, null=True)  # có thể là tên job, user hoặc hành động
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Lịch sử hoạt động"
        verbose_name_plural = "Lịch sử hoạt động"

    def __str__(self):
        return f"{self.user.username} - {self.action} - {self.timestamp}"
