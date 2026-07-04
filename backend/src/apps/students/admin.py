from django.contrib import admin

from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('admission_no', 'student_name', 'student_class', 'division', 'gender', 'house', 'status', 'is_deleted')
    search_fields = ('admission_no', 'student_name')
    list_filter = ('student_class', 'division', 'gender', 'status', 'is_deleted', 'house')
