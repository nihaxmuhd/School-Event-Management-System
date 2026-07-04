from django.core.exceptions import ValidationError


def validate_student_class(value: str):
    allowed_values = {'8', '9', '10', '11', '12'}
    if value not in allowed_values:
        raise ValidationError('Student class must be one of 8, 9, 10, 11, or 12.')


def validate_division(value: str):
    allowed_values = {'A', 'B', 'C'}
    if value not in allowed_values:
        raise ValidationError('Division must be one of A, B, or C.')


def validate_gender(value: str):
    allowed_values = {'Male', 'Female'}
    if value not in allowed_values:
        raise ValidationError('Gender must be Male or Female.')
