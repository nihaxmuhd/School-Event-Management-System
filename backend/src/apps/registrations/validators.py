from django.core.exceptions import ValidationError

from apps.events.models import Event
from apps.students.models import Student


def validate_registration_eligibility(*, student: Student, event: Event):
    if student.is_deleted or student.status != Student.StatusChoices.ACTIVE:
        raise ValidationError('Inactive students cannot register.')
    if not student.house.is_active:
        raise ValidationError('Inactive houses cannot register.')
    if not event.is_active:
        raise ValidationError('Inactive events cannot accept registrations.')
    if event.status == Event.StatusChoices.REGISTRATION_CLOSED:
        raise ValidationError('Registration closed events cannot accept new registrations.')
