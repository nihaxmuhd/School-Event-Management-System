from django.db.models import Count
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request

from apps.common.utils import api_response
from apps.students.models import Student
from apps.students.serializers import StudentSerializer

from .filters import apply_house_filters
from .models import House
from .permissions import HousePermission
from .selectors import active_house_queryset, house_queryset, house_students_queryset
from .serializers import HouseSerializer
from .services import HouseService


class HouseViewSet(viewsets.ModelViewSet):
    serializer_class = HouseSerializer
    permission_classes = [IsAuthenticated, HousePermission]
    ordering_fields = ['name', 'code', 'created_at', 'updated_at']
    ordering = ['name']

    def get_queryset(self):
        queryset = house_queryset()
        if getattr(self.request.user, 'is_superuser', False) or getattr(self.request.user, 'is_staff', False):
            return apply_house_filters(queryset, self.request.query_params)
        user_house = getattr(self.request.user, 'house', None)
        if user_house is not None:
            return queryset.filter(id=user_house.id)
        return queryset.none()

    def list(self, request: Request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return api_response(message='Houses retrieved successfully', data=serializer.data)

    def create(self, request: Request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        house = HouseService.create_house(data=serializer.validated_data, user=request.user)
        return api_response(message='House created successfully', data=self.get_serializer(house).data, status_code=status.HTTP_201_CREATED)

    def retrieve(self, request: Request, *args, **kwargs):
        instance = self.get_object()
        return api_response(message='House retrieved successfully', data=self.get_serializer(instance).data)

    def partial_update(self, request: Request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        house = HouseService.update_house(house=instance, data=serializer.validated_data, user=request.user)
        return api_response(message='House updated successfully', data=self.get_serializer(house).data)

    def destroy(self, request: Request, *args, **kwargs):
        instance = self.get_object()
        HouseService.soft_delete_house(house=instance, user=request.user)
        return api_response(message='House deleted successfully', data={})

    @action(detail=True, methods=['get'], url_path='students')
    def students(self, request: Request, pk=None):
        house = self.get_object()
        queryset = house_students_queryset(house.id)
        serializer = StudentSerializer(queryset, many=True)
        return api_response(message='House students retrieved successfully', data=serializer.data)

    @action(detail=True, methods=['get'], url_path='summary')
    def summary(self, request: Request, pk=None):
        house = self.get_object()
        stats = self._build_house_stats(house)
        return api_response(message='House summary retrieved successfully', data=stats)

    @action(detail=False, methods=['get'], url_path='leaderboard')
    def leaderboard(self, request: Request):
        houses = [self._build_house_stats(house) for house in active_house_queryset()]
        houses = sorted(houses, key=lambda item: (-item['total_house_points'], -item['gold_count'], -item['silver_count'], -item['bronze_count'], item['name']))
        for index, item in enumerate(houses, start=1):
            item['current_rank'] = index
        return api_response(message='House leaderboard retrieved successfully', data=houses)

    def _build_house_stats(self, house: House):
        students = Student.objects.filter(house=house, is_deleted=False)
        total_students = students.count()
        total_registered_students = students.exclude(status=Student.StatusChoices.ACTIVE).count()
        return {
            'id': house.id,
            'name': house.name,
            'code': house.code,
            'color': house.color,
            'is_active': house.is_active,
            'total_students': total_students,
            'total_registered_students': total_registered_students,
            'total_events_participated': 0,
            'total_house_points': 0,
            'gold_count': 0,
            'silver_count': 0,
            'bronze_count': 0,
            'current_rank': 0,
        }
