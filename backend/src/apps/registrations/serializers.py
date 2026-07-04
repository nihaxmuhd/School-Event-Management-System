from rest_framework import serializers

from apps.events.models import Event
from apps.students.models import Student

from .models import Registration


class RegistrationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.student_name', read_only=True)
    admission_no = serializers.CharField(source='student.admission_no', read_only=True)
    event_name = serializers.CharField(source='event.name', read_only=True)
    event_code = serializers.CharField(source='event.code', read_only=True)

    class Meta:
        model = Registration
        fields = [
            'id',
            'student',
            'student_name',
            'admission_no',
            'event',
            'event_name',
            'event_code',
            'house_snapshot',
            'category_snapshot',
            'registration_status',
            'registered_by',
            'registered_at',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by',
        ]
        read_only_fields = ['id', 'house_snapshot', 'category_snapshot', 'registered_by', 'registered_at', 'created_at', 'updated_at', 'created_by', 'updated_by']

    def validate(self, attrs):
        student = attrs.get('student')
        event = attrs.get('event')
        if student and event and Registration.objects.filter(student=student, event=event).exists():
            raise serializers.ValidationError({'non_field_errors': ['Duplicate registration is not allowed.']})
        return attrs


class RegistrationCreateSerializer(serializers.Serializer):
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.filter(is_deleted=False))
    event = serializers.PrimaryKeyRelatedField(queryset=Event.objects.filter(is_active=True))


class RegistrationSummarySerializer(serializers.Serializer):
    count = serializers.IntegerField()


class RegistrationByGroupSerializer(serializers.Serializer):
    group_id = serializers.CharField()
    registrations = RegistrationSerializer(many=True)
