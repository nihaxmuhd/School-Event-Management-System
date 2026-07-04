from .models import Event


def event_queryset():
    return Event.objects.select_related('created_by', 'updated_by').all()


def active_event_queryset():
    return event_queryset().filter(is_active=True)


def available_events_queryset():
    return event_queryset().filter(is_active=True).exclude(status=Event.StatusChoices.REGISTRATION_CLOSED)
