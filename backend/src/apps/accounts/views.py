from django.utils.crypto import get_random_string
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.common.utils import api_response

from .models import User
from .permissions import IsAdmin
from .serializers import (
    AdminUserWriteSerializer,
    LoginSerializer,
    PasswordResetSerializer,
    UserSerializer,
)


class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer


class RefreshView(TokenRefreshView):
    permission_classes = [AllowAny]


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh = request.data.get("refresh")
        if refresh:
            try:
                RefreshToken(refresh).blacklist()
            except Exception:
                pass
        return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)


class CurrentUserView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = User.objects.filter(is_deleted=False, is_superuser=False).order_by("username")

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return AdminUserWriteSerializer
        return UserSerializer

    def get_queryset(self):
        return User.objects.filter(is_deleted=False, is_superuser=False).order_by("username")

    def list(self, request, *args, **kwargs):
        serializer = UserSerializer(self.get_queryset(), many=True)
        return api_response(message="Users retrieved successfully", data=serializer.data)

    def create(self, request, *args, **kwargs):
        payload = request.data.copy()
        if not payload.get("password"):
            payload["password"] = get_random_string(12)
        serializer = AdminUserWriteSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return api_response(message="User created successfully", data=UserSerializer(user).data, status_code=status.HTTP_201_CREATED)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        return api_response(message="User retrieved successfully", data=UserSerializer(instance).data)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = AdminUserWriteSerializer(instance, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return api_response(message="User updated successfully", data=UserSerializer(user).data)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = AdminUserWriteSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return api_response(message="User updated successfully", data=UserSerializer(user).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_deleted = True
        instance.is_active = False
        instance.save(update_fields=["is_deleted", "is_active", "updated_at"])
        return api_response(message="User deleted successfully", data={})

    @action(detail=True, methods=["post"], url_path="reset-password")
    def reset_password(self, request, pk=None):
        instance = self.get_object()
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance.set_password(serializer.validated_data["password"])
        instance.save(update_fields=["password", "updated_at"])
        return api_response(message="Password reset successfully", data={})

    @action(detail=True, methods=["post"], url_path="activate")
    def activate(self, request, pk=None):
        instance = self.get_object()
        instance.is_active = True
        instance.save(update_fields=["is_active", "updated_at"])
        return api_response(message="User activated successfully", data=UserSerializer(instance).data)

    @action(detail=True, methods=["post"], url_path="deactivate")
    def deactivate(self, request, pk=None):
        instance = self.get_object()
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])
        return api_response(message="User deactivated successfully", data=UserSerializer(instance).data)
    
