from rest_framework.permissions import BasePermission, SAFE_METHODS


class JudgingPermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return getattr(request.user, 'is_staff', False) or getattr(request.user, 'is_superuser', False)


class ResultPermission(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return getattr(request.user, 'is_staff', False) or getattr(request.user, 'is_superuser', False)
