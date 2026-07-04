from decimal import Decimal

from django.core.exceptions import ValidationError


def validate_marks(marks, maximum_marks):
    if marks is None:
        raise ValidationError('Marks are required.')
    value = Decimal(str(marks))
    if value < 0 or value > Decimal(str(maximum_marks)):
        raise ValidationError('Marks must be within the configured range.')
