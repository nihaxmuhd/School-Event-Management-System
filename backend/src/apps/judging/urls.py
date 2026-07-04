from rest_framework.routers import DefaultRouter

from .views import JudgingViewSet, LeaderboardViewSet, ResultViewSet

router = DefaultRouter()
router.register(r'judging', JudgingViewSet, basename='judging')
router.register(r'results', ResultViewSet, basename='result')
router.register(r'leaderboard', LeaderboardViewSet, basename='leaderboard')

urlpatterns = router.urls
