from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from apps.common.utils import api_response
from apps.events.models import Event
from apps.houses.models import House
from apps.judging.models import Result
from apps.registrations.models import Registration
from apps.students.models import Student

from .calculators import DashboardCalculator
from .selectors import (
    event_queryset,
    house_queryset,
    house_registrations_queryset,
    house_results_queryset,
    registration_queryset,
    result_queryset,
    settings_object,
    student_queryset,
)
from .serializers import SystemSettingsSerializer
from .services import SettingsService


def _dashboard_payload(*, house_id=None):
    students = student_queryset()
    houses = house_queryset()
    events = event_queryset()
    registrations = registration_queryset()
    results = result_queryset()
    if house_id is not None:
        students = students.filter(house_id=house_id)
        registrations = registrations.filter(student__house_id=house_id)
        results = results.filter(registration__student__house_id=house_id)
    active_events = events.filter(is_active=True).exclude(status=Event.StatusChoices.COMPLETED)
    completed_events = events.filter(status=Event.StatusChoices.COMPLETED)
    house_rankings = DashboardCalculator.house_rankings()
    return {
        'total_students': students.count(),
        'total_houses': houses.count(),
        'total_events': events.count(),
        'total_registrations': registrations.count(),
        'pending_registrations': registrations.filter(registration_status=Registration.StatusChoices.PENDING).count(),
        'completed_events': completed_events.count(),
        'active_events': active_events.count(),
        'total_house_points': sum(item['total_house_points'] for item in house_rankings),
        'house_rankings': house_rankings,
        'top_performing_houses': house_rankings[:3],
        'recent_results': list(results.order_by('-updated_at').values('id', 'final_score', 'rank', 'position', 'house_points')[:10]),
        'participation_statistics': {
            'registrations': registrations.count(),
            'students_with_registrations': students.filter(registrations__isnull=False).distinct().count(),
        },
    }


def _house_dashboard_payload(house_id):
    house = House.objects.get(id=house_id)
    students = student_queryset().filter(house_id=house_id)
    registrations = house_registrations_queryset(house_id)
    results = house_results_queryset(house_id)
    house_rankings = DashboardCalculator.house_rankings()
    ranking = next((item for item in house_rankings if str(item['house_id']) == str(house_id)), None)
    if ranking is None:
        ranking = {'rank': None, 'total_house_points': 0}
    return {
        'house': {
            'id': house.id,
            'name': house.name,
            'code': house.code,
            'color': house.color,
            'is_active': house.is_active,
        },
        'total_students': students.count(),
        'total_houses': 1,
        'total_events': event_queryset().count(),
        'total_registrations': registrations.count(),
        'pending_registrations': registrations.filter(registration_status=Registration.StatusChoices.PENDING).count(),
        'completed_events': results.filter(registration__event__status=Event.StatusChoices.COMPLETED).values('registration__event_id').distinct().count(),
        'active_events': event_queryset().filter(is_active=True).exclude(status=Event.StatusChoices.COMPLETED).count(),
        'total_house_points': ranking['total_house_points'],
        'house_rankings': [ranking],
        'top_performing_houses': house_rankings[:3],
        'recent_results': list(results.order_by('-updated_at').values('id', 'final_score', 'rank', 'position', 'house_points')[:10]),
        'participation_statistics': {
            'registrations': registrations.count(),
            'students_with_registrations': students.filter(registrations__isnull=False).distinct().count(),
        },
    }


def _can_manage_settings(user):
    return getattr(user, 'is_superuser', False) or getattr(user, 'is_staff', False)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    if not getattr(request.user, 'is_superuser', False):
        raise PermissionDenied('Only Super Admin can access the admin dashboard.')
    return api_response(message='Admin dashboard retrieved successfully', data=_dashboard_payload())


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def house_dashboard(request, id):
    user = request.user
    if not _can_manage_settings(user):
        user_house = getattr(user, 'house', None)
        if user_house is None or str(user_house.id) != str(id):
            raise PermissionDenied('You do not have access to this house dashboard.')
    return api_response(message='House dashboard retrieved successfully', data=_house_dashboard_payload(id))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def team_leader_dashboard(request):
    user_house = getattr(request.user, 'house', None)
    if user_house is None:
        raise PermissionDenied('Team leader account must be assigned to a house.')
    return api_response(message='Team leader dashboard retrieved successfully', data=_dashboard_payload(house_id=user_house.id))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def manager_dashboard(request):
    if not getattr(request.user, 'is_staff', False) or getattr(request.user, 'is_superuser', False):
        raise PermissionDenied('Only Admin/Manager can access the manager dashboard.')
    return api_response(message='Manager dashboard retrieved successfully', data=_dashboard_payload())


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def settings_detail(request):
    if request.method == 'PATCH' and not _can_manage_settings(request.user):
        raise PermissionDenied('Only Super Admin and Admin can update settings.')
    settings_obj = settings_object()
    if request.method == 'PATCH':
        serializer = SystemSettingsSerializer(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        settings_obj = SettingsService.update_settings(data=serializer.validated_data)
    serializer = SystemSettingsSerializer(settings_obj)
    return api_response(message='Settings retrieved successfully', data=serializer.data)
