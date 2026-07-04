from django.contrib import admin

from .models import JudgeAssignment, JudgeScore, Result


@admin.register(JudgeAssignment)
class JudgeAssignmentAdmin(admin.ModelAdmin):
    list_display = ('event', 'judge', 'is_active', 'created_at')


@admin.register(JudgeScore)
class JudgeScoreAdmin(admin.ModelAdmin):
    list_display = ('registration', 'judge', 'marks', 'submitted_at')
    search_fields = ('registration__student__student_name', 'registration__event__name', 'judge__username')


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ('registration', 'final_score', 'rank', 'position', 'house_points', 'published_status')
