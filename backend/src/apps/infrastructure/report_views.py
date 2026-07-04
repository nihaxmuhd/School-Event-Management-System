from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from apps.common.utils import api_response

from .report_selectors import event_report_rows, house_report_rows, leaderboard_rows, registration_report_rows, result_report_rows, student_report_rows
from .reporting import export_csv, export_excel, export_pdf


def _deliver(rows, headers, title, export_format):
    if export_format == 'csv':
        return export_csv(rows, headers), 'text/csv'
    if export_format == 'xlsx':
        return export_excel(rows, headers, title), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    if export_format == 'pdf':
        return export_pdf(rows, headers, title), 'application/pdf'
    return None, None


def _report_response(rows, headers, title, request):
    export_format = request.query_params.get('format')
    content, content_type = _deliver(rows, headers, title, export_format)
    if content is not None:
        from django.http import HttpResponse
        response = HttpResponse(content, content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{title.lower().replace(" ", "_")}.{export_format}"'
        return response
    return api_response(message=f'{title} retrieved successfully', data=rows)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def students_report(request):
    rows = student_report_rows()
    headers = ['admission_no', 'student_name', 'student_class', 'division', 'gender', 'status', 'house__name']
    return _report_response(rows, headers, 'Student Report', request)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def houses_report(request):
    rows = house_report_rows()
    headers = ['name', 'code', 'color', 'is_active']
    return _report_response(rows, headers, 'House Report', request)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def events_report(request):
    rows = event_report_rows()
    headers = ['name', 'code', 'category', 'event_type', 'status', 'maximum_participants', 'maximum_team_size', 'maximum_marks']
    return _report_response(rows, headers, 'Event Report', request)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def results_report(request):
    rows = result_report_rows()
    headers = ['registration__student__student_name', 'registration__event__name', 'final_score', 'rank', 'position', 'house_points', 'published_status']
    return _report_response(rows, headers, 'Result Report', request)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def registrations_report(request):
    rows = registration_report_rows()
    headers = ['student__student_name', 'event__name', 'registration_status', 'registered_at']
    return _report_response(rows, headers, 'Registration Report', request)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def leaderboard_report(request):
    rows = leaderboard_rows()
    headers = ['rank', 'house_name', 'house_code', 'house_color', 'total_house_points', 'gold_count', 'silver_count', 'bronze_count', 'participation_count']
    return _report_response(rows, headers, 'Leaderboard Report', request)
