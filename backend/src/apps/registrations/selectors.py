from django.db.models import Count, QuerySet

from .models import Registration


def registration_queryset() -> QuerySet[Registration]:
    return Registration.objects.select_related('student', 'student__house', 'event', 'registered_by', 'created_by', 'updated_by')


def registrations_by_house(house_id) -> QuerySet[Registration]:
    return registration_queryset().filter(student__house_id=house_id)


def registrations_by_event(event_id) -> QuerySet[Registration]:
    return registration_queryset().filter(event_id=event_id)


def registrations_by_student(student_id) -> QuerySet[Registration]:
    return registration_queryset().filter(student_id=student_id)


def pending_registrations_queryset() -> QuerySet[Registration]:
    return registration_queryset().filter(student__registrations__isnull=False)


def event_registration_count(event_id) -> int:
    return Registration.objects.filter(event_id=event_id).count()


def student_participation_count(student_id) -> int:
    return Registration.objects.filter(student_id=student_id).count()


def house_registration_count(house_id) -> int:
    return Registration.objects.filter(student__house_id=house_id).count()
