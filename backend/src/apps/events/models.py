import uuid

from django.conf import settings
from django.db import models

from apps.common.models import TimeStampedModel


class Event(TimeStampedModel):
    class EventTypeChoices(models.TextChoices):
        INDIVIDUAL = 'Individual', 'Individual'
        GROUP = 'Group', 'Group'

    class StatusChoices(models.TextChoices):
        DRAFT = 'Draft', 'Draft'
        REGISTRATION_OPEN = 'Registration Open', 'Registration Open'
        REGISTRATION_CLOSED = 'Registration Closed', 'Registration Closed'
        JUDGING = 'Judging', 'Judging'
        COMPLETED = 'Completed', 'Completed'
        PUBLISHED = 'Published', 'Published'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, unique=True, db_index=True)
    code = models.CharField(max_length=50, unique=True, db_index=True)
    category = models.CharField(max_length=100, db_index=True)
    event_type = models.CharField(max_length=20, choices=EventTypeChoices.choices)
    maximum_participants = models.PositiveIntegerField()
    maximum_team_size = models.PositiveIntegerField(null=True, blank=True)
    maximum_marks = models.PositiveIntegerField(default=100)
    number_of_judges = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=30, choices=StatusChoices.choices, default=StatusChoices.DRAFT, db_index=True)
    display_order = models.PositiveIntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_events',
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_events',
    )

    class Meta:
        ordering = ['display_order', 'name']

    def __str__(self):
        return self.name
