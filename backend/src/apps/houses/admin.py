from django.contrib import admin

from .models import House


@admin.register(House)
class HouseAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'color', 'is_active', 'created_at', 'updated_at')
    search_fields = ('name', 'code')
    list_filter = ('is_active',)
