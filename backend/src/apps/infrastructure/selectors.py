from django.db.models import Count, Sum

from apps.events.models import Event
from apps.houses.models import House
from apps.judging.models import Result
from apps.registrations.models import Registration
from apps.students.models import Student

from .models import SystemSettings


def settings_object():
    return SystemSettings.get_solo()


def student_queryset():
    return Student.objects.select_related('house', 'created_by', 'updated_by')


def house_queryset():
    return House.objects.select_related('created_by', 'updated_by')


def event_queryset():
    return Event.objects.select_related('created_by', 'updated_by')


def registration_queryset():
    return Registration.objects.select_related('student', 'student__house', 'event', 'created_by', 'updated_by')


def result_queryset():
    return Result.objects.select_related('registration', 'registration__student', 'registration__student__house', 'registration__event')


def house_results_queryset(house_id):
    return result_queryset().filter(registration__student__house_id=house_id)


def house_registrations_queryset(house_id):
    return registration_queryset().filter(student__house_id=house_id)
