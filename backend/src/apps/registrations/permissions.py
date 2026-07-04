from rest_framework.permissions import BasePermission, SAFE_METHODS


class RegistrationPermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return getattr(request.user, 'is_staff', False) or getattr(request.user, 'is_superuser', False) or getattr(request.user, 'role', None) == 'Team Leader'

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if getattr(request.user, 'is_staff', False) or getattr(request.user, 'is_superuser', False):
            return True
        user_house = getattr(request.user, 'house', None)
        return user_house is not None and str(obj.student.house_id) == str(user_house.id)
