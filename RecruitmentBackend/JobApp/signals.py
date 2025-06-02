from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.apps import apps
from NotificationApp.services import (
    create_notification_for_new_job,
    create_notification_for_job_status_change,
)

JobPosting = apps.get_model('JobApp', 'JobPosting')

@receiver(post_save, sender=JobPosting)
def job_posting_created(sender, instance, created, **kwargs):
    if created:
        # Việc làm mới được tạo
        create_notification_for_new_job(instance)

@receiver(pre_save, sender=JobPosting)
def job_posting_status_changed(sender, instance, **kwargs):
    if not instance.pk:
        return  # Bản ghi mới, chưa có pk
    try:
        old_instance = JobPosting.objects.get(pk=instance.pk)
    except JobPosting.DoesNotExist:
        return
    if old_instance.status != instance.status:
        # Trạng thái đã thay đổi
        create_notification_for_job_status_change(instance, old_instance.status, instance.status)
