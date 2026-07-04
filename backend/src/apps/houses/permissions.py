from rest_framework.permissions import BasePermission, SAFE_METHODS


class HousePermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return getattr(request.user, 'is_staff', False) or getattr(request.user, 'is_superuser', False)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            if getattr(request.user, 'is_staff', False) or getattr(request.user, 'is_superuser', False):
                return True
            user_house = getattr(request.user, 'house', None)
            return user_house is not None and str(user_house.id) == str(obj.id)
        return getattr(request.user, 'is_staff', False) or getattr(request.user, 'is_superuser', False)
