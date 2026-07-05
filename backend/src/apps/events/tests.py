from django.conf import settings
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Event


class EventModelTest(TestCase):
    def test_event_str(self):
        event = Event.objects.create(
            name='Extempore',
            code='EXT-001',
            category='Junior Boys',
            event_type='Individual',
            maximum_participants=10,
            maximum_marks=100,
            number_of_judges=3,
        )
        self.assertEqual(str(event), 'Extempore')


class EventApiSmokeTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='admin', password='pass12345', is_staff=True)
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.event = Event.objects.create(
            name='Extempore',
            code='EXT-001',
            category='Junior Boys',
            event_type='Individual',
            maximum_participants=10,
            maximum_marks=100,
            number_of_judges=3,
        )

    def test_list_endpoint(self):
        response = self.client.get('/api/v1/events/')
        self.assertEqual(response.status_code, 200)
