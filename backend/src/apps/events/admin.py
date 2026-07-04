from django.contrib import admin

from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'category', 'event_type', 'status', 'is_active', 'display_order')
    search_fields = ('name', 'code', 'category')
    list_filter = ('event_type', 'status', 'is_active', 'category')
