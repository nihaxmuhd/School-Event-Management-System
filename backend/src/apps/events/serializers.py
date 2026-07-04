from rest_framework import serializers

from .models import Event
from .validators import (
    validate_category,
    validate_event_code,
    validate_event_name,
    validate_maximum_participants,
    validate_team_size,
)


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            'id',
            'name',
            'code',
            'category',
            'event_type',
            'maximum_participants',
            'maximum_team_size',
            'maximum_marks',
            'number_of_judges',
            'status',
            'display_order',
            'is_active',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']

    def validate_name(self, value):
        value = value.strip()
        instance = getattr(self, 'instance', None)
        queryset = Event.objects.filter(name__iexact=value)
        if instance:
            queryset = queryset.exclude(pk=instance.pk)
        if queryset.exists():
            raise serializers.ValidationError('Event name must be unique.')
        return value

    def validate_code(self, value):
        value = value.strip().upper()
        instance = getattr(self, 'instance', None)
        queryset = Event.objects.filter(code__iexact=value)
        if instance:
            queryset = queryset.exclude(pk=instance.pk)
        if queryset.exists():
            raise serializers.ValidationError('Event code must be unique.')
        return value

    def validate_category(self, value):
        validate_category(value)
        return value

    def validate_maximum_participants(self, value):
        validate_maximum_participants(value)
        return value

    def validate(self, attrs):
        event_type = attrs.get('event_type', getattr(self.instance, 'event_type', None))
        maximum_team_size = attrs.get('maximum_team_size', getattr(self.instance, 'maximum_team_size', None))
        validate_team_size(maximum_team_size, event_type)
        return attrs


class EventSummarySerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    code = serializers.CharField()
    category = serializers.CharField()
    event_type = serializers.CharField()
    maximum_participants = serializers.IntegerField()
    maximum_team_size = serializers.IntegerField(allow_null=True)
    maximum_marks = serializers.IntegerField()
    number_of_judges = serializers.IntegerField()
    status = serializers.CharField()
    display_order = serializers.IntegerField()
    is_active = serializers.BooleanField()
    participant_count = serializers.IntegerField()
    registration_status = serializers.CharField()
