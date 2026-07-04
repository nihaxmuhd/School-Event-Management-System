from django.db.models import QuerySet
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request

from apps.common.utils import api_response

from .models import Student
from .permissions import IsAdminOrReadOwnHouse
from .selectors import pending_students_queryset, student_queryset
from .serializers import (
    StudentExportSerializer,
    StudentImportConfirmSerializer,
    StudentImportPreviewSerializer,
    StudentImportUploadSerializer,
    StudentSerializer,
)
from .services import StudentService


class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOwnHouse]
    search_fields = ['admission_no', 'student_name']
    ordering_fields = ['student_name', 'admission_no', 'student_class', 'division', 'created_at', 'updated_at']
    ordering = ['student_name']

    def get_queryset(self) -> QuerySet[Student]:
        queryset = student_queryset()
        search = self.request.query_params.get('search')
        queryset = StudentService.search(queryset, search)
        student_class = self.request.query_params.get('student_class')
        division = self.request.query_params.get('division')
        gender = self.request.query_params.get('gender')
        house = self.request.query_params.get('house')
        status_value = self.request.query_params.get('status')
        if student_class:
            queryset = queryset.filter(student_class=student_class)
        if division:
            queryset = queryset.filter(division=division)
        if gender:
            queryset = queryset.filter(gender=gender)
        if house:
            queryset = queryset.filter(house_id=house)
        if status_value:
            queryset = queryset.filter(status=status_value)
        user = self.request.user
        if getattr(user, 'is_staff', False):
            return queryset
        house = getattr(user, 'house', None)
        if house:
            return queryset.filter(house=house)
        return queryset.none()

    def create(self, request: Request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = StudentService.create_student(data=serializer.validated_data, user=request.user)
        return api_response(
            message='Student created successfully',
            data=StudentSerializer(student, context=self.get_serializer_context()).data,
            status_code=status.HTTP_201_CREATED,
        )

    def retrieve(self, request: Request, *args, **kwargs):
        instance = self.get_object()
        return api_response(message='Student retrieved successfully', data=self.get_serializer(instance).data)

    def list(self, request: Request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return api_response(message='Students retrieved successfully', data=serializer.data)

    def partial_update(self, request: Request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        student = StudentService.update_student(student=instance, data=serializer.validated_data, user=request.user)
        return api_response(message='Student updated successfully', data=self.get_serializer(student).data)

    def destroy(self, request: Request, *args, **kwargs):
        instance = self.get_object()
        StudentService.soft_delete_student(student=instance, user=request.user)
        return api_response(message='Student deleted successfully', data={})

    @action(detail=False, methods=['get'], url_path='pending')
    def pending(self, request: Request):
        queryset = pending_students_queryset()
        user = request.user
        if not getattr(user, 'is_staff', False):
            house = getattr(user, 'house', None)
            if house:
                queryset = queryset.filter(house=house)
            else:
                queryset = queryset.none()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(message='Pending students retrieved successfully', data=serializer.data)

    @action(detail=False, methods=['get', 'post'], url_path='import')
    def import_students(self, request: Request):
        if request.method == 'GET':
            return api_response(
                message='Upload an Excel file to preview student import',
                data={'workflow': ['upload', 'validate', 'preview', 'confirm import', 'save']},
            )

        if request.data.get('confirm') not in [True, 'true', 'True', '1', 1]:
            upload_serializer = StudentImportUploadSerializer(data=request.data)
            upload_serializer.is_valid(raise_exception=True)
            file_bytes = upload_serializer.validated_data['file'].read()
            existing = set(Student.objects.filter(is_deleted=False).values_list('admission_no', flat=True))
            preview_rows = StudentService.preview_import(file_bytes, existing_admission_nos=existing)
            serializer = StudentImportPreviewSerializer({
                'rows': preview_rows,
                'valid_count': sum(1 for row in preview_rows if row.is_valid),
                'invalid_count': sum(1 for row in preview_rows if not row.is_valid),
            })
            return api_response(
                message='Import preview generated successfully',
                data=serializer.data,
            )

        confirm_serializer = StudentImportConfirmSerializer(data=request.data)
        confirm_serializer.is_valid(raise_exception=True)
        preview_rows = [row for row in confirm_serializer.validated_data['rows']]
        created_students = StudentService.import_students(
            preview_rows=[
                type('Row', (), row) for row in preview_rows
            ],
            user=request.user,
        )
        return api_response(
            message='Students imported successfully',
            data=StudentSerializer(created_students, many=True).data,
            status_code=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=['get'], url_path='export')
    def export_students(self, request: Request):
        queryset = self.filter_queryset(self.get_queryset())
        data = StudentExportSerializer(queryset, many=True).data
        return api_response(message='Students exported successfully', data=data)
