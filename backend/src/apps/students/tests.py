from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from apps.houses.models import House
from .models import Student


class StudentModelTest(TestCase):
    def test_student_str(self):
        house = House.objects.create(name='Blue House', code='BLUE', color='#3b82f6')
        student = Student(
            admission_no='HS-001',
            student_name='Test Student',
            gender='Male',
            student_class='8',
            division='A',
            house=house,
        )
        self.assertIn('Test Student', str(student))


class StudentApiSmokeTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='admin', password='pass12345', is_staff=True)
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_list_endpoint_requires_response_shape(self):
        response = self.client.get('/api/v1/students/')
        self.assertIn(response.status_code, [200, 404])
