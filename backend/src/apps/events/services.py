from django.core.exceptions import ValidationError

from .models import Event
from .validators import (
    validate_category,
    validate_event_code,
    validate_event_name,
    validate_maximum_participants,
    validate_team_size,
)


class EventService:
    @staticmethod
    def create_event(*, data: dict, user=None) -> Event:
        validate_event_name(data.get('name', ''))
        validate_event_code(data.get('code', ''))
        validate_category(data.get('category', ''))
        validate_maximum_participants(data.get('maximum_participants'))
        validate_team_size(data.get('maximum_team_size'), data.get('event_type'))
        event = Event(**data)
        event.created_by = user
        event.updated_by = user
        event.full_clean()
        event.save()
        return event

    @staticmethod
    def update_event(*, event: Event, data: dict, user=None) -> Event:
        if 'name' in data:
            validate_event_name(data['name'])
        if 'code' in data:
            validate_event_code(data['code'])
        if 'category' in data:
            validate_category(data['category'])
        if 'maximum_participants' in data:
            validate_maximum_participants(data['maximum_participants'])
        event_type = data.get('event_type', event.event_type)
        if 'maximum_team_size' in data or 'event_type' in data:
            validate_team_size(data.get('maximum_team_size', event.maximum_team_size), event_type)
        for key, value in data.items():
            setattr(event, key, value)
        event.updated_by = user
        event.full_clean()
        event.save()
        return event

    @staticmethod
    def delete_event(*, event: Event):
        event.delete()

    @staticmethod
    def change_status(*, event: Event, status: str, user=None) -> Event:
        event.status = status
        event.updated_by = user
        event.save(update_fields=['status', 'updated_by', 'updated_at'])
        return event
