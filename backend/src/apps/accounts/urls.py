from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CurrentUserView, LoginView, LogoutView, RefreshView, UserViewSet

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="user")

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", RefreshView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path(
        "me/",
        CurrentUserView.as_view(),
        name="current-user",
    ),
    path("", include(router.urls)),
]
