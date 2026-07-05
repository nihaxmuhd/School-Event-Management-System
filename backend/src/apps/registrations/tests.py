from django.conf import settings
from django.test import TestCase
from rest_framework.test import APIClient

from apps.events.models import Event
from apps.houses.models import House
from apps.students.models import Student

from .models import Registration


class RegistrationModelTest(TestCase):
    def test_registration_str(self):
        house = House.objects.create(name='Blue House', code='BLUE', color='#3b82f6')
        student = Student.objects.create(
            admission_no='HS-001',
            student_name='Test Student',
            gender='Male',
            student_class='8',
            division='A',
            house=house,
        )
        event = Event.objects.create(
            name='Extempore',
            code='EXT-001',
            category='Junior Boys',
            event_type='Individual',
            maximum_participants=10,
            maximum_marks=100,
            number_of_judges=3,
        )
        reg = Registration.objects.create(student=student, event=event, house_snapshot='Blue House', category_snapshot='Junior Boys')
        self.assertTrue(str(reg))


class RegistrationApiSmokeTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='admin', password='pass12345', is_staff=True)
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.house = House.objects.create(name='Blue House', code='BLUE', color='#3b82f6')
        self.student = Student.objects.create(
            admission_no='HS-001',
            student_name='Test Student',
            gender='Male',
            student_class='8',
            division='A',
            house=self.house,
        )
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
        response = self.client.get('/api/v1/registrations/')
        self.assertEqual(response.status_code, 200)
