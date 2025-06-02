from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.apps import apps
from NotificationApp.services import (
    create_notification_for_application_status_change,
    create_notification_for_interview_status_change,
)

Application = apps.get_model('ApplicationApp', 'Application')
Interview = apps.get_model('ApplicationApp', 'Interview')

@receiver(pre_save, sender=Application)
def application_status_change(sender, instance, **kwargs):
    if not instance.pk:
        # Ứng dụng mới tạo, chưa cần check trạng thái cũ
        return
    try:
        old_instance = Application.objects.get(pk=instance.pk)
    except Application.DoesNotExist:
        return
    if old_instance.status != instance.status:
        create_notification_for_application_status_change(instance, old_instance.status, instance.status)

@receiver(pre_save, sender=Interview)
def interview_status_change(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        old_instance = Interview.objects.get(pk=instance.pk)
    except Interview.DoesNotExist:
        return
    if old_instance.status != instance.status:
        create_notification_for_interview_status_change(instance, old_instance.status, instance.status)
