from django.db.models import Count, QuerySet
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request

from apps.common.utils import api_response
from .filters import apply_event_filters
from .models import Event
from .permissions import EventPermission
from .selectors import active_event_queryset, event_queryset
from .serializers import EventSerializer, EventSummarySerializer
from .services import EventService


class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated, EventPermission]
    search_fields = ['name', 'code', 'category']
    ordering_fields = ['display_order', 'name', 'code', 'created_at', 'updated_at']
    ordering = ['display_order', 'name']

    def get_queryset(self) -> QuerySet[Event]:
        queryset = event_queryset()
        queryset = apply_event_filters(queryset, self.request.query_params)
        if getattr(self.request.user, 'is_staff', False) or getattr(self.request.user, 'is_superuser', False):
            return queryset
        return queryset.filter(is_active=True)

    def list(self, request: Request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return api_response(message='Events retrieved successfully', data=serializer.data)

    def create(self, request: Request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        event = EventService.create_event(data=serializer.validated_data, user=request.user)
        return api_response(message='Event created successfully', data=self.get_serializer(event).data, status_code=status.HTTP_201_CREATED)

    def retrieve(self, request: Request, *args, **kwargs):
        event = self.get_object()
        return api_response(message='Event retrieved successfully', data=self.get_serializer(event).data)

    def partial_update(self, request: Request, *args, **kwargs):
        event = self.get_object()
        serializer = self.get_serializer(event, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = EventService.update_event(event=event, data=serializer.validated_data, user=request.user)
        return api_response(message='Event updated successfully', data=self.get_serializer(updated).data)

    def destroy(self, request: Request, *args, **kwargs):
        event = self.get_object()
        EventService.delete_event(event=event)
        return api_response(message='Event deleted successfully', data={})

    @action(detail=False, methods=['get'], url_path='active')
    def active(self, request: Request):
        serializer = self.get_serializer(active_event_queryset(), many=True)
        return api_response(message='Active events retrieved successfully', data=serializer.data)

    @action(detail=True, methods=['get'], url_path='summary')
    def summary(self, request: Request, pk=None):
        event = self.get_object()
        payload = {
            'id': event.id,
            'name': event.name,
            'code': event.code,
            'category': event.category,
            'event_type': event.event_type,
            'maximum_participants': event.maximum_participants,
            'maximum_team_size': event.maximum_team_size,
            'maximum_marks': event.maximum_marks,
            'number_of_judges': event.number_of_judges,
            'status': event.status,
            'display_order': event.display_order,
            'is_active': event.is_active,
            'participant_count': 0,
            'registration_status': 'closed' if event.status == Event.StatusChoices.REGISTRATION_CLOSED else 'open',
        }
        serializer = EventSummarySerializer(payload)
        return api_response(message='Event summary retrieved successfully', data=serializer.data)
