from rest_framework import serializers

from apps.students.serializers import StudentSerializer

from .models import House


class HouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = House
        fields = [
            'id',
            'name',
            'code',
            'color',
            'is_active',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']

    def validate_name(self, value):
        value = value.strip()
        queryset = House.objects.filter(name__iexact=value)
        instance = getattr(self, 'instance', None)
        if instance:
            queryset = queryset.exclude(pk=instance.pk)
        if queryset.exists():
            raise serializers.ValidationError('House name must be unique.')
        return value

    def validate_code(self, value):
        value = value.strip().upper()
        queryset = House.objects.filter(code__iexact=value)
        instance = getattr(self, 'instance', None)
        if instance:
            queryset = queryset.exclude(pk=instance.pk)
        if queryset.exists():
            raise serializers.ValidationError('House code must be unique.')
        return value


class HouseSummarySerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    code = serializers.CharField()
    color = serializers.CharField()
    is_active = serializers.BooleanField()
    total_students = serializers.IntegerField()
    total_registered_students = serializers.IntegerField()
    total_events_participated = serializers.IntegerField()
    total_house_points = serializers.IntegerField()
    gold_count = serializers.IntegerField()
    silver_count = serializers.IntegerField()
    bronze_count = serializers.IntegerField()
    current_rank = serializers.IntegerField()


class HouseStudentSerializer(StudentSerializer):
    class Meta(StudentSerializer.Meta):
        fields = StudentSerializer.Meta.fields
