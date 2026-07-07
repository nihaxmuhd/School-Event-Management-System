from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User

UserModel = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
            "is_active",
            "is_deleted",
        )

    def get_role(self, obj):
        return obj.get_role_display()


class AdminUserWriteSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=8, trim_whitespace=False)
    username = serializers.CharField(write_only=True, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=User.Role.choices)

    class Meta:
        model = User
        fields = (
            "id",
            "full_name",
            "username",
            "email",
            "role",
            "password",
            "is_active",
        )
        read_only_fields = ("id",)

    def validate_email(self, value):
        value = value.strip().lower()
        instance = getattr(self, "instance", None)
        queryset = User.objects.filter(email__iexact=value, is_deleted=False)
        if instance:
            queryset = queryset.exclude(pk=instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("Email must be unique.")
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        username = attrs.get("username", "").strip()
        if not username and self.instance is None:
            base = attrs["email"].split("@")[0]
            username = base
            suffix = 1
            while User.objects.filter(username__iexact=username).exists():
                username = f"{base}{suffix}"
                suffix += 1
            attrs["username"] = username
        return attrs

    def create(self, validated_data):
        full_name = validated_data.pop("full_name").strip()
        password = validated_data.pop("password")
        username = validated_data.pop("username").strip()
        first_name, last_name = self._split_name(full_name)
        user = User(
            username=username,
            email=validated_data["email"].strip().lower(),
            role=validated_data["role"],
            is_active=validated_data.get("is_active", True),
            first_name=first_name,
            last_name=last_name,
            is_staff=True,
            is_deleted=False,
        )
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        full_name = validated_data.pop("full_name", None)
        password = validated_data.pop("password", None)
        username = validated_data.pop("username", None)
        if full_name is not None:
            first_name, last_name = self._split_name(full_name.strip())
            instance.first_name = first_name
            instance.last_name = last_name
        if username is not None and username.strip():
            instance.username = username.strip()
        if "email" in validated_data:
            instance.email = validated_data["email"].strip().lower()
        if "role" in validated_data:
            instance.role = validated_data["role"]
        if "is_active" in validated_data:
            instance.is_active = validated_data["is_active"]
        if password:
            validate_password(password, user=instance)
            instance.set_password(password)
        instance.save()
        return instance

    def to_representation(self, instance):
        return UserSerializer(instance).data

    def _split_name(self, full_name: str):
        parts = full_name.split()
        if len(parts) == 1:
            return parts[0], ""
        return " ".join(parts[:-1]), parts[-1]


class PasswordResetSerializer(serializers.Serializer):
    password = serializers.CharField(min_length=8, trim_whitespace=False)

    def validate_password(self, value):
        validate_password(value)
        return value


class LoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.get_role_display()
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        if getattr(self.user, "is_deleted", False):
            raise serializers.ValidationError("User account is deleted.")
        data["user"] = UserSerializer(self.user).data
        return data

    
