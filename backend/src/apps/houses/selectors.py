from django.db.models import Count, Q

from apps.students.models import Student

from .models import House


def house_queryset():
    return House.objects.select_related('created_by', 'updated_by').all()


def active_house_queryset():
    return house_queryset().filter(is_active=True)


def house_students_queryset(house_id):
    return Student.objects.select_related('house').filter(house_id=house_id, is_deleted=False)


def house_leaderboard_queryset():
    return House.objects.annotate(
        total_students=Count('students', filter=Q(students__is_deleted=False), distinct=True),
        total_registered_students=Count('students', filter=Q(students__is_deleted=False, students__team_leader_assigned=True), distinct=True),
    ).filter(is_active=True)
