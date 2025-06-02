from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.apps import apps
from NotificationApp.services import (
    create_notification_for_user_registration,
    create_notification_for_role_approved,
)
from django.utils import timezone

User = apps.get_model('AuthApp', 'MyUser')
UserRole = apps.get_model('AuthApp', 'UserRole')

@receiver(post_save, sender=User)
def user_registered(sender, instance, created, **kwargs):
    if created:
        create_notification_for_user_registration(instance)

@receiver(pre_save, sender=UserRole)
def userrole_approval_status_change(sender, instance, **kwargs):
    if not instance.pk:
        return
    try:
        old_instance = UserRole.objects.get(pk=instance.pk)
    except UserRole.DoesNotExist:
        return
    if not old_instance.is_approved and instance.is_approved:
        create_notification_for_role_approved(instance)
