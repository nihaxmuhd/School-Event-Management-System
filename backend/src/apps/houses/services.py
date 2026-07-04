from django.core.exceptions import ValidationError

from apps.students.models import Student

from .models import House
from .validators import validate_house_code, validate_house_color, validate_house_name


class HouseService:
    @staticmethod
    def create_house(*, data: dict, user=None) -> House:
        validate_house_name(data.get('name', ''))
        validate_house_code(data.get('code', ''))
        validate_house_color(data.get('color', ''))
        house = House(**data)
        house.created_by = user
        house.updated_by = user
        house.full_clean()
        house.save()
        return house

    @staticmethod
    def update_house(*, house: House, data: dict, user=None) -> House:
        for key, value in data.items():
            setattr(house, key, value)
        house.updated_by = user
        house.full_clean()
        house.save()
        return house

    @staticmethod
    def soft_delete_house(*, house: House, user=None) -> House:
        active_students = Student.objects.filter(house=house, is_deleted=False, status=Student.StatusChoices.ACTIVE).exists()
        if active_students:
            raise ValidationError('Cannot delete house while active students exist.')
        house.is_active = False
        house.updated_by = user
        house.save(update_fields=['is_active', 'updated_by', 'updated_at'])
        return house

    @staticmethod
    def set_house_active(*, house: House, is_active: bool, user=None) -> House:
        house.is_active = is_active
        house.updated_by = user
        house.save(update_fields=['is_active', 'updated_by', 'updated_at'])
        return house
