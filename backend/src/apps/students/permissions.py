from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrReadOwnHouse(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return getattr(request.user, 'is_staff', False)

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            if getattr(request.user, 'is_staff', False):
                return True
            house_id = getattr(getattr(request.user, 'house', None), 'id', None)
            return house_id is not None and str(obj.house_id) == str(house_id)
        return getattr(request.user, 'is_staff', False)
