from django.db.models import QuerySet
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request

from apps.common.utils import api_response
from apps.events.models import Event
from apps.registrations.models import Registration

from .filters import apply_judging_filters
from .models import JudgeScore, Result
from .permissions import JudgingPermission, ResultPermission
from .selectors import judge_score_queryset, published_result_queryset, result_queryset
from .serializers import JudgeScoreSerializer, LeaderboardSerializer, ResultSerializer
from .services import JudgingService


class JudgingViewSet(viewsets.ModelViewSet):
    serializer_class = JudgeScoreSerializer
    permission_classes = [IsAuthenticated, JudgingPermission]
    ordering_fields = ['submitted_at', 'created_at', 'updated_at']
    ordering = ['-submitted_at']

    def get_queryset(self) -> QuerySet[JudgeScore]:
        return apply_judging_filters(judge_score_queryset(), self.request.query_params)

    def list(self, request: Request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return api_response(message='Judge scores retrieved successfully', data=serializer.data)

    def create(self, request: Request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        score = JudgingService.submit_score(
            registration=serializer.validated_data['registration'],
            judge=request.user,
            marks=serializer.validated_data['marks'],
            remarks=serializer.validated_data.get('remarks', ''),
            user=request.user,
        )
        return api_response(message='Marks submitted successfully', data=self.get_serializer(score).data, status_code=status.HTTP_201_CREATED)

    def partial_update(self, request: Request, *args, **kwargs):
        score = self.get_object()
        if Result.objects.filter(registration=score.registration, published_status=True).exists():
            return api_response(success=False, message='Published results are read only.', data={}, errors=None, status_code=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(score, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = JudgingService.submit_score(
            registration=score.registration,
            judge=request.user,
            marks=serializer.validated_data.get('marks', score.marks),
            remarks=serializer.validated_data.get('remarks', score.remarks),
            user=request.user,
        )
        return api_response(message='Marks updated successfully', data=self.get_serializer(updated).data)


class ResultViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, ResultPermission]

    def list(self, request: Request):
        queryset = result_queryset()
        if not getattr(request.user, 'is_staff', False) and not getattr(request.user, 'is_superuser', False):
            queryset = queryset.filter(published_status=True)
        serializer = ResultSerializer(queryset, many=True)
        return api_response(message='Results retrieved successfully', data=serializer.data)

    @action(detail=False, methods=['get'], url_path='(?P<event_id>[^/.]+)')
    def by_event(self, request: Request, event_id=None):
        queryset = result_queryset().filter(registration__event_id=event_id)
        if not getattr(request.user, 'is_staff', False) and not getattr(request.user, 'is_superuser', False):
            queryset = queryset.filter(published_status=True)
        serializer = ResultSerializer(queryset, many=True)
        return api_response(message='Event results retrieved successfully', data=serializer.data)

    @action(detail=False, methods=['post'], url_path='(?P<event_id>[^/.]+)/publish')
    def publish(self, request: Request, event_id=None):
        event = Event.objects.get(id=event_id)
        results = JudgingService.publish_results(event, user=request.user)
        serializer = ResultSerializer(results, many=True)
        return api_response(message='Results published successfully', data=serializer.data)

    @action(detail=False, methods=['post'], url_path='(?P<event_id>[^/.]+)/recalculate')
    def recalculate(self, request: Request, event_id=None):
        event = Event.objects.get(id=event_id)
        results = JudgingService.recalculate_results(event)
        serializer = ResultSerializer(results, many=True)
        return api_response(message='Results recalculated successfully', data=serializer.data)


class LeaderboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request: Request):
        data = JudgingService.leaderboard()
        serializer = LeaderboardSerializer(data, many=True)
        return api_response(message='Leaderboard retrieved successfully', data=serializer.data)
