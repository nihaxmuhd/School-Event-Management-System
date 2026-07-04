from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from apps.events.models import Event
from apps.houses.models import House
from apps.registrations.models import Registration
from apps.students.models import Student

from .models import JudgeAssignment


class JudgingSmokeTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='judge', password='pass12345', is_staff=True)
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
            number_of_judges=1,
        )
        self.registration = Registration.objects.create(
            student=self.student,
            event=self.event,
            house_snapshot=self.house.name,
            category_snapshot=self.event.category,
        )
        JudgeAssignment.objects.create(event=self.event, judge=self.user)

    def test_list_judging_endpoint(self):
        response = self.client.get('/api/v1/judging/')
        self.assertEqual(response.status_code, 200)
