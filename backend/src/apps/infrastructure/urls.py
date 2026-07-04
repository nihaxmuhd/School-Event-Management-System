from django.urls import path

from .views import admin_dashboard, house_dashboard, manager_dashboard, settings_detail, team_leader_dashboard

urlpatterns = [
    path('dashboard/admin/', admin_dashboard),
    path('dashboard/house/<uuid:id>/', house_dashboard),
    path('dashboard/team-leader/', team_leader_dashboard),
    path('dashboard/manager/', manager_dashboard),
    path('settings/', settings_detail),
]

