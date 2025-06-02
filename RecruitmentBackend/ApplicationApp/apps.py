from django.apps import AppConfig


class ApplicationappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ApplicationApp'

    def ready(self):
        import ApplicationApp.signals