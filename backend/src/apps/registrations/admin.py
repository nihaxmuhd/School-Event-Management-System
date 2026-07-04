from django.contrib import admin

from .models import Registration


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ('student', 'event', 'registration_status', 'registered_at')
    search_fields = ('student__admission_no', 'student__student_name', 'event__name', 'event__code')
    list_filter = ('registration_status', 'event')
