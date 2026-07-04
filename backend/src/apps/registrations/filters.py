def apply_registration_filters(queryset, params):
    house_id = params.get('house_id')
    event_id = params.get('event_id')
    student_id = params.get('student_id')
    if house_id:
        queryset = queryset.filter(student__house_id=house_id)
    if event_id:
        queryset = queryset.filter(event_id=event_id)
    if student_id:
        queryset = queryset.filter(student_id=student_id)
    return queryset
