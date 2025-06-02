from django.apps import AppConfig


class ResumeappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ResumeApp'

    def ready(self):
        import ResumeApp.signals