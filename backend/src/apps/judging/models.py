import uuid

from django.contrib.auth.models import User
from django.db import models

from apps.common.models import TimeStampedModel


class JudgeAssignment(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey('events.Event', on_delete=models.PROTECT, related_name='judge_assignments')
    judge = models.ForeignKey(User, on_delete=models.PROTECT, related_name='judge_assignments')
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('event', 'judge')


class JudgeScore(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    registration = models.ForeignKey('registrations.Registration', on_delete=models.PROTECT, related_name='judge_scores')
    judge = models.ForeignKey(User, on_delete=models.PROTECT, related_name='judge_scores')
    marks = models.DecimalField(max_digits=6, decimal_places=2)
    remarks = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_judge_scores')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_judge_scores')

    class Meta:
        unique_together = ('registration', 'judge')
        ordering = ['-submitted_at']


class Result(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    registration = models.OneToOneField('registrations.Registration', on_delete=models.PROTECT, related_name='result')
    final_score = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    rank = models.IntegerField(default=0)
    position = models.IntegerField(default=0)
    house_points = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    published_status = models.BooleanField(default=False, db_index=True)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['rank', 'position']
