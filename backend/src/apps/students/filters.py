import django_filters

from .models import Student


class StudentFilter(django_filters.FilterSet):
    student_class = django_filters.CharFilter(field_name='student_class', lookup_expr='exact')
    division = django_filters.CharFilter(field_name='division', lookup_expr='exact')
    gender = django_filters.CharFilter(field_name='gender', lookup_expr='exact')
    house = django_filters.CharFilter(field_name='house__id', lookup_expr='exact')
    status = django_filters.CharFilter(field_name='status', lookup_expr='exact')

    class Meta:
        model = Student
        fields = ['student_class', 'division', 'gender', 'house', 'status']
