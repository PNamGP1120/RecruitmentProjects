import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone

class Conversation(models.Model):
    """
    Cuộc trò chuyện giữa hai hoặc nhiều người dùng.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # Thời gian cập nhật tin nhắn cuối cùng (có thể update khi có message mới)

    def __str__(self):
        return f"Conversation {self.id} ({self.participants.count()} participants)"

    class Meta:
        ordering = ['-updated_at']
        verbose_name = "Cuộc trò chuyện"
        verbose_name_plural = "Các cuộc trò chuyện"

class Message(models.Model):
    """
    Tin nhắn trong cuộc trò chuyện.
    """
    TEXT = 'text'
    IMAGE = 'image'
    FILE = 'file'

    MESSAGE_TYPE_CHOICES = [
        (TEXT, 'Văn bản'),
        (IMAGE, 'Hình ảnh'),
        (FILE, 'File'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField(blank=True, null=True)
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPE_CHOICES, default=TEXT)
    file = models.FileField(upload_to='chat_files/', blank=True, null=True)
    timestamp = models.DateTimeField(default=timezone.now)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Message {self.id} from {self.sender.username} at {self.timestamp}"

    class Meta:
        ordering = ['timestamp']
        verbose_name = "Tin nhắn"
        verbose_name_plural = "Các tin nhắn"
