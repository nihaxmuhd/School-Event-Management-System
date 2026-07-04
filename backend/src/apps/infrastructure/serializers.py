from rest_framework import serializers

from .models import SystemSettings


class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = [
            'school_name',
            'festival_name',
            'academic_year',
            'maximum_participation_limit',
            'maximum_group_size',
            'first_place_points',
            'second_place_points',
            'third_place_points',
            'participation_points',
            'maximum_marks',
            'judging_method',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

