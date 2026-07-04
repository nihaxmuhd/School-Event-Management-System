import os
from django.core.exceptions import ValidationError


def configured_categories():
    raw = os.getenv('EVENT_CATEGORIES', 'Junior Boys,Junior Girls,Senior Boys,Senior Girls')
    return [item.strip() for item in raw.split(',') if item.strip()]


def validate_event_name(value: str):
    if not value or not value.strip():
        raise ValidationError('Event name is required.')


def validate_event_code(value: str):
    if not value or not value.strip():
        raise ValidationError('Event code is required.')


def validate_category(value: str):
    if value not in configured_categories():
        raise ValidationError('Category is not configured for this installation.')


def validate_maximum_participants(value: int):
    if value is None or value <= 0:
        raise ValidationError('Maximum participants must be greater than zero.')


def validate_team_size(value, event_type: str):
    if event_type == 'Group' and (value is None or value <= 0):
        raise ValidationError('Maximum team size is required for group events.')
