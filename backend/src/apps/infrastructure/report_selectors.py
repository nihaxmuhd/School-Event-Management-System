from apps.events.models import Event
from apps.houses.models import House
from apps.judging.models import Result
from apps.registrations.models import Registration
from apps.students.models import Student


def student_report_rows():
    return list(Student.objects.select_related('house').values('admission_no', 'student_name', 'student_class', 'division', 'gender', 'status', 'house__name'))


def house_report_rows():
    return list(House.objects.values('name', 'code', 'color', 'is_active'))


def event_report_rows():
    return list(Event.objects.values('name', 'code', 'category', 'event_type', 'status', 'maximum_participants', 'maximum_team_size', 'maximum_marks'))


def registration_report_rows():
    return list(Registration.objects.select_related('student', 'event').values('student__student_name', 'event__name', 'registration_status', 'registered_at'))


def result_report_rows():
    return list(Result.objects.select_related('registration__student', 'registration__event').values('registration__student__student_name', 'registration__event__name', 'final_score', 'rank', 'position', 'house_points', 'published_status'))


def leaderboard_rows():
    from .calculators import DashboardCalculator
    return DashboardCalculator.house_rankings()

