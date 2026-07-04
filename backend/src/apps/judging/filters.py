def apply_judging_filters(queryset, params):
    event_id = params.get('event_id')
    judge_id = params.get('judge_id')
    if event_id:
        queryset = queryset.filter(registration__event_id=event_id)
    if judge_id:
        queryset = queryset.filter(judge_id=judge_id)
    return queryset
