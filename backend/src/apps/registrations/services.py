import os

from django.core.exceptions import ValidationError
from django.db import transaction

from apps.events.models import Event
from apps.houses.models import House
from apps.students.models import Student

from .models import Registration
from .validators import validate_registration_eligibility


def max_events_per_student() -> int:
    return int(os.getenv('MAX_EVENTS_PER_STUDENT', '4'))


class RegistrationService:
    @staticmethod
    def create_registration(*, student: Student, event: Event, user=None) -> Registration:
        validate_registration_eligibility(student=student, event=event)
        if not getattr(user, 'is_staff', False) and not getattr(user, 'is_superuser', False):
            user_house = getattr(user, 'house', None)
            if user_house is None or str(user_house.id) != str(student.house_id):
                raise ValidationError('Team leaders can only register students from their own house.')
        if Registration.objects.filter(student=student, event=event).exists():
            raise ValidationError('Duplicate registration is not allowed.')
        if Registration.objects.filter(student=student).count() >= max_events_per_student():
            raise ValidationError('Student participation limit reached.')
        event_count = Registration.objects.filter(event=event).count()
        if event_count >= event.maximum_participants:
            raise ValidationError('Event capacity reached.')
        reg = Registration.objects.create(
            student=student,
            event=event,
            house_snapshot=student.house.name,
            category_snapshot=event.category,
            registered_by=user,
            created_by=user,
            updated_by=user,
        )
        student.team_leader_assigned = True
        student.save(update_fields=['team_leader_assigned', 'updated_at'])
        return reg

    @staticmethod
    def remove_registration(*, registration: Registration):
        registration.delete()

    @staticmethod
    def event_registration_count(*, event_id):
        return Registration.objects.filter(event_id=event_id).count()

    @staticmethod
    def student_participation_count(*, student_id):
        return Registration.objects.filter(student_id=student_id).count()

    @staticmethod
    def house_registration_count(*, house_id):
        return Registration.objects.filter(student__house_id=house_id).count()
