from django.urls import path

from .report_views import events_report, houses_report, leaderboard_report, registrations_report, results_report, students_report

urlpatterns = [
    path('reports/students/', students_report),
    path('reports/houses/', houses_report),
    path('reports/events/', events_report),
    path('reports/results/', results_report),
    path('reports/registrations/', registrations_report),
    path('reports/leaderboard/', leaderboard_report),
]
