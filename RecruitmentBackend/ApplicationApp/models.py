import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class ApplicationStatus(models.TextChoices):
    APPLIED = 'Applied', 'Đã nộp hồ sơ'
    INTERVIEW_SCHEDULED = 'Interview Scheduled', 'Đã lên lịch phỏng vấn'
    OFFERED = 'Offered', 'Đã được đề nghị nhận việc'
    REJECTED = 'Rejected', 'Bị từ chối'
    HIRED = 'Hired', 'Đã nhận việc'
    WITHDRAWN = 'Withdrawn', 'Rút hồ sơ'


class Application(BaseModel):
    job_seeker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applications')
    job_posting = models.ForeignKey('JobApp.JobPosting', on_delete=models.CASCADE, related_name='applications')
    resume = models.ForeignKey('ResumeApp.Resume', on_delete=models.SET_NULL, null=True, blank=True,
                               related_name='applications')
    status = models.CharField(max_length=30, choices=ApplicationStatus.choices, default=ApplicationStatus.APPLIED)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cover_letter = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('job_seeker', 'job_posting')
        ordering = ['-applied_at']
        verbose_name = "Ứng tuyển"
        verbose_name_plural = "Các đơn ứng tuyển"

    def __str__(self):
        return f"{self.job_seeker.username} ứng tuyển {self.job_posting.title}"


class InterviewStatus(models.TextChoices):
    SCHEDULED = 'Scheduled', 'Đã lên lịch'
    COMPLETED = 'Completed', 'Đã hoàn thành'
    CANCELED = 'Canceled', 'Đã hủy'


class Interview(BaseModel):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='interviews')
    scheduled_at = models.DateTimeField()
    location = models.CharField(max_length=255, blank=True, null=True)  # hoặc link video call
    status = models.CharField(max_length=20, choices=InterviewStatus.choices, default=InterviewStatus.SCHEDULED)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['scheduled_at']
        verbose_name = "Phỏng vấn"
        verbose_name_plural = "Các buổi phỏng vấn"

    def __str__(self):
        return f"Phỏng vấn {self.application.job_seeker.username} - {self.application.job_posting.title} vào {self.scheduled_at}"
