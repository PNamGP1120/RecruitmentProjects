from django.db.models.signals import post_save
from django.dispatch import receiver
from django.apps import apps
from NotificationApp.services import create_notification_for_resume_created, create_notification_for_resume_activated

Resume = apps.get_model('ResumeApp', 'Resume')

@receiver(post_save, sender=Resume)
def resume_post_save(sender, instance, created, **kwargs):
    if created:
        # Khi tạo resume mới
        create_notification_for_resume_created(instance)
    else:
        # Khi resume được cập nhật, kiểm tra nếu is_active mới là True thì tạo thông báo kích hoạt
        if instance.is_active:
            create_notification_for_resume_activated(instance)
