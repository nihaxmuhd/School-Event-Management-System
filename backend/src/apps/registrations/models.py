import uuid

from django.conf import settings
from django.db import models

from apps.common.models import TimeStampedModel


class Registration(TimeStampedModel):
    class StatusChoices(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        CONFIRMED = 'Confirmed', 'Confirmed'
        CANCELLED = 'Cancelled', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey('students.Student', on_delete=models.PROTECT, related_name='registrations')
    event = models.ForeignKey('events.Event', on_delete=models.PROTECT, related_name='registrations')
    house_snapshot = models.CharField(max_length=255)
    category_snapshot = models.CharField(max_length=100)
    registration_status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.CONFIRMED)
    registered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='registrations_made',
    )
    registered_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_registrations',
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_registrations',
    )

    class Meta:
        unique_together = ('student', 'event')
        ordering = ['-registered_at']

    def __str__(self):
        return f'{self.student_id} -> {self.event_id}'
