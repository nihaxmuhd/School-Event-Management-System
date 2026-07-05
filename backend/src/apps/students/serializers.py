from django.conf import settings
from rest_framework import serializers

from .models import Student
from .validators import validate_division, validate_gender, validate_student_class


class StudentSerializer(serializers.ModelSerializer):
    house_name = serializers.CharField(source='house.name', read_only=True)

    class Meta:
        model = Student
        fields = [
            'id',
            'admission_no',
            'student_name',
            'gender',
            'student_class',
            'division',
            'house',
            'house_name',
            'team_leader_assigned',
            'status',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']

    def validate_admission_no(self, value):
        value = value.strip()
        instance = getattr(self, 'instance', None)
        queryset = Student.objects.filter(admission_no__iexact=value, is_deleted=False)
        if instance:
            queryset = queryset.exclude(pk=instance.pk)
        if queryset.exists():
            raise serializers.ValidationError('Admission number already exists.')
        return value

    def validate_student_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Student name is required.')
        return value

    def validate_student_class(self, value):
        validate_student_class(value)
        return value

    def validate_division(self, value):
        validate_division(value)
        return value

    def validate_gender(self, value):
        validate_gender(value)
        return value


class StudentImportUploadSerializer(serializers.Serializer):
    file = serializers.FileField()


class StudentImportPreviewRowSerializer(serializers.Serializer):
    row_number = serializers.IntegerField()
    admission_no = serializers.CharField()
    student_name = serializers.CharField()
    gender = serializers.CharField()
    student_class = serializers.CharField()
    division = serializers.CharField()
    house_id = serializers.CharField()
    is_valid = serializers.BooleanField()
    errors = serializers.ListField(child=serializers.CharField())


class StudentImportPreviewSerializer(serializers.Serializer):
    rows = StudentImportPreviewRowSerializer(many=True)
    valid_count = serializers.IntegerField()
    invalid_count = serializers.IntegerField()


class StudentImportConfirmSerializer(serializers.Serializer):
    rows = StudentImportPreviewRowSerializer(many=True)

    def validate(self, attrs):
        rows = attrs['rows']
        invalid_rows = [row for row in rows if not row['is_valid']]
        if invalid_rows:
            raise serializers.ValidationError({'rows': 'Fix validation errors before confirming import.'})
        return attrs


class StudentExportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['admission_no', 'student_name', 'student_class', 'division', 'gender', 'status']
