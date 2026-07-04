from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'success': True,
            'message': 'Data retrieved successfully',
            'data': data,
            'errors': None,
            'meta': {
                'count': self.page.paginator.count,
                'page': self.page.number,
                'page_size': self.get_page_size(self.request),
                'next': self.get_next_link(),
                'previous': self.get_previous_link(),
            },
        })


def api_response(*, success=True, message='', data=None, errors=None, status_code=200):
    return Response({
        'success': success,
        'message': message,
        'data': data if data is not None else {},
        'errors': errors,
    }, status=status_code)
