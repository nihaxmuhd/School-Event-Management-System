from django.db.models import QuerySet

from .models import JudgeAssignment, JudgeScore, Result


def judge_assignment_queryset() -> QuerySet[JudgeAssignment]:
    return JudgeAssignment.objects.select_related('event', 'judge')


def judge_score_queryset() -> QuerySet[JudgeScore]:
    return JudgeScore.objects.select_related('registration', 'registration__student', 'registration__event', 'judge')


def result_queryset() -> QuerySet[Result]:
    return Result.objects.select_related('registration', 'registration__student', 'registration__event')


def published_result_queryset() -> QuerySet[Result]:
    return result_queryset().filter(published_status=True)
