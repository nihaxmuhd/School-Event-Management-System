from rest_framework.routers import DefaultRouter

from .views import HouseViewSet

router = DefaultRouter()
router.register(r'houses', HouseViewSet, basename='house')

urlpatterns = router.urls
