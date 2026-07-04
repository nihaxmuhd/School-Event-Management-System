from django.db import models

from apps.common.models import TimeStampedModel


class SystemSettings(TimeStampedModel):
    school_name = models.CharField(max_length=255, default='')
    festival_name = models.CharField(max_length=255, default='')
    academic_year = models.CharField(max_length=50, default='')
    maximum_participation_limit = models.PositiveIntegerField(default=0)
    maximum_group_size = models.PositiveIntegerField(default=0)
    first_place_points = models.PositiveIntegerField(default=10)
    second_place_points = models.PositiveIntegerField(default=7)
    third_place_points = models.PositiveIntegerField(default=5)
    participation_points = models.PositiveIntegerField(default=2)
    maximum_marks = models.PositiveIntegerField(default=100)
    judging_method = models.CharField(max_length=20, default='Average')

    class Meta:
        verbose_name = 'System Settings'
        verbose_name_plural = 'System Settings'

    def __str__(self):
        return 'System Settings'

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
