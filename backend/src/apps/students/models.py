import uuid

from django.contrib.auth.models import User
from django.db import models

from apps.common.models import TimeStampedModel


class Student(TimeStampedModel):
    class GenderChoices(models.TextChoices):
        MALE = 'Male', 'Male'
        FEMALE = 'Female', 'Female'

    class StatusChoices(models.TextChoices):
        ACTIVE = 'Active', 'Active'
        INACTIVE = 'Inactive', 'Inactive'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admission_no = models.CharField(max_length=50, unique=True, db_index=True)
    student_name = models.CharField(max_length=255, db_index=True)
    gender = models.CharField(max_length=10, choices=GenderChoices.choices)
    student_class = models.CharField(max_length=10, db_index=True)
    division = models.CharField(max_length=10, db_index=True)
    house = models.ForeignKey('houses.House', on_delete=models.PROTECT, related_name='students')
    team_leader_assigned = models.BooleanField(default=False)
    status = models.CharField(max_length=10, choices=StatusChoices.choices, default=StatusChoices.ACTIVE, db_index=True)
    is_deleted = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_students',
    )
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_students',
    )

    class Meta:
        ordering = ['student_name']

    def __str__(self):
        return f'{self.student_name} ({self.admission_no})'
