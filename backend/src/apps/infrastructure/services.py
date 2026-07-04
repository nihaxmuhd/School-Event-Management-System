from django.db import transaction

from .models import SystemSettings


class SettingsService:
    @staticmethod
    @transaction.atomic
    def update_settings(*, data: dict) -> SystemSettings:
        settings_obj = SystemSettings.get_solo()
        for key, value in data.items():
            setattr(settings_obj, key, value)
        settings_obj.full_clean()
        settings_obj.save()
        return settings_obj

