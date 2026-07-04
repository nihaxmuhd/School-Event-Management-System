from django.core.exceptions import ValidationError


def validate_house_name(value: str):
    if not value or not value.strip():
        raise ValidationError('House name is required.')


def validate_house_code(value: str):
    if not value or not value.strip():
        raise ValidationError('House code is required.')


def validate_house_color(value: str):
    if not value or not value.strip():
        raise ValidationError('House color is required.')
