def apply_house_filters(queryset, params):
    is_active = params.get('is_active')
    if is_active not in [None, '']:
        if str(is_active).lower() in ['true', '1', 'yes']:
            queryset = queryset.filter(is_active=True)
        elif str(is_active).lower() in ['false', '0', 'no']:
            queryset = queryset.filter(is_active=False)
    return queryset
