def apply_event_filters(queryset, params):
    category = params.get('category')
    status_value = params.get('status')
    event_type = params.get('event_type')
    is_active = params.get('is_active')
    if category:
        queryset = queryset.filter(category=category)
    if status_value:
        queryset = queryset.filter(status=status_value)
    if event_type:
        queryset = queryset.filter(event_type=event_type)
    if is_active not in [None, '']:
        queryset = queryset.filter(is_active=str(is_active).lower() in ['true', '1', 'yes'])
    return queryset
