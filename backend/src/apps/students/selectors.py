from django.db.models import QuerySet

from .models import Student


def student_queryset() -> QuerySet[Student]:
    return Student.objects.select_related('house', 'created_by', 'updated_by').filter(is_deleted=False)


def pending_students_queryset() -> QuerySet[Student]:
    return student_queryset().filter(team_leader_assigned=False)
