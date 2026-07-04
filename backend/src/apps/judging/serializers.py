from decimal import Decimal

from rest_framework import serializers

from apps.events.models import Event
from apps.registrations.models import Registration

from .models import JudgeAssignment, JudgeScore, Result
from .validators import validate_marks


class JudgeAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = JudgeAssignment
        fields = ['id', 'event', 'judge', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class JudgeScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = JudgeScore
        fields = ['id', 'registration', 'judge', 'marks', 'remarks', 'submitted_at', 'created_at', 'updated_at', 'created_by', 'updated_by']
        read_only_fields = ['id', 'submitted_at', 'created_at', 'updated_at', 'created_by', 'updated_by']

    def validate(self, attrs):
        registration = attrs.get('registration')
        marks = attrs.get('marks')
        validate_marks(marks, registration.event.maximum_marks)
        return attrs


class ResultSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='registration.student.student_name', read_only=True)
    admission_no = serializers.CharField(source='registration.student.admission_no', read_only=True)
    house_name = serializers.CharField(source='registration.student.house.name', read_only=True)
    event_name = serializers.CharField(source='registration.event.name', read_only=True)

    class Meta:
        model = Result
        fields = [
            'id',
            'registration',
            'student_name',
            'admission_no',
            'house_name',
            'event_name',
            'final_score',
            'rank',
            'position',
            'house_points',
            'published_status',
            'published_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class LeaderboardSerializer(serializers.Serializer):
    house_id = serializers.UUIDField()
    house_name = serializers.CharField()
    house_code = serializers.CharField()
    house_color = serializers.CharField()
    total_house_points = serializers.DecimalField(max_digits=10, decimal_places=2)
    gold_count = serializers.IntegerField()
    silver_count = serializers.IntegerField()
    bronze_count = serializers.IntegerField()
    participation_count = serializers.IntegerField()
