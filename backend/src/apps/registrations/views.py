from django.db.models import QuerySet
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request

from apps.common.utils import api_response
from apps.students.models import Student

from .filters import apply_registration_filters
from .models import Registration
from .permissions import RegistrationPermission
from .selectors import (
    house_registration_count,
    registrations_by_event,
    registrations_by_house,
    registrations_by_student,
    registration_queryset,
    student_participation_count,
)
from .serializers import RegistrationCreateSerializer, RegistrationSerializer
from .services import RegistrationService


class RegistrationViewSet(viewsets.ModelViewSet):
    serializer_class = RegistrationSerializer
    permission_classes = [IsAuthenticated, RegistrationPermission]
    ordering_fields = ['registered_at', 'created_at', 'updated_at']
    ordering = ['-registered_at']

    def get_queryset(self) -> QuerySet[Registration]:
        queryset = apply_registration_filters(registration_queryset(), self.request.query_params)
        user = self.request.user
        if getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False):
            return queryset
        user_house = getattr(user, 'house', None)
        if user_house is not None:
            return queryset.filter(student__house=user_house)
        return queryset.none()

    def list(self, request: Request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return api_response(message='Registrations retrieved successfully', data=serializer.data)

    def create(self, request: Request, *args, **kwargs):
        serializer = RegistrationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        registration = RegistrationService.create_registration(
            student=serializer.validated_data['student'],
            event=serializer.validated_data['event'],
            user=request.user,
        )
        return api_response(message='Registration created successfully', data=RegistrationSerializer(registration).data, status_code=status.HTTP_201_CREATED)

    def retrieve(self, request: Request, *args, **kwargs):
        registration = self.get_object()
        return api_response(message='Registration retrieved successfully', data=self.get_serializer(registration).data)

    def destroy(self, request: Request, *args, **kwargs):
        registration = self.get_object()
        RegistrationService.remove_registration(registration=registration)
        return api_response(message='Registration removed successfully', data={})

    @action(detail=False, methods=['get'], url_path='by-house/(?P<house_id>[^/.]+)')
    def by_house(self, request: Request, house_id=None):
        serializer = self.get_serializer(registrations_by_house(house_id), many=True)
        return api_response(message='House registrations retrieved successfully', data=serializer.data)

    @action(detail=False, methods=['get'], url_path='by-event/(?P<event_id>[^/.]+)')
    def by_event(self, request: Request, event_id=None):
        serializer = self.get_serializer(registrations_by_event(event_id), many=True)
        return api_response(message='Event registrations retrieved successfully', data=serializer.data)

    @action(detail=False, methods=['get'], url_path='by-student/(?P<student_id>[^/.]+)')
    def by_student(self, request: Request, student_id=None):
        serializer = self.get_serializer(registrations_by_student(student_id), many=True)
        return api_response(message='Student registrations retrieved successfully', data=serializer.data)

    @action(detail=False, methods=['get'], url_path='pending')
    def pending(self, request: Request):
        queryset = Student.objects.filter(is_deleted=False, status=Student.StatusChoices.ACTIVE, registrations__isnull=True)
        user = request.user
        if not getattr(user, 'is_staff', False) and not getattr(user, 'is_superuser', False):
            user_house = getattr(user, 'house', None)
            if user_house is not None:
                queryset = queryset.filter(house=user_house)
            else:
                queryset = queryset.none()
        serializer = Student.objects.none()
        data = [
            {
                'id': student.id,
                'admission_no': student.admission_no,
                'student_name': student.student_name,
                'gender': student.gender,
                'student_class': student.student_class,
                'division': student.division,
                'house': student.house_id,
                'team_leader_assigned': student.team_leader_assigned,
                'status': student.status,
                'created_at': student.created_at,
                'updated_at': student.updated_at,
                'created_by': student.created_by_id,
                'updated_by': student.updated_by_id,
            }
            for student in queryset.select_related('house', 'created_by', 'updated_by')
        ]
        return api_response(message='Pending students retrieved successfully', data=data)
