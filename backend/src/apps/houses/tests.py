from django.conf import settings
from django.test import TestCase
from rest_framework.test import APIClient

from .models import House


class HouseModelTest(TestCase):
    def test_house_str(self):
        house = House.objects.create(name='Blue House', code='BLUE', color='#3b82f6')
        self.assertEqual(str(house), 'Blue House')


class HouseApiSmokeTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='admin', password='pass12345', is_staff=True)
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.house = House.objects.create(name='Blue House', code='BLUE', color='#3b82f6')

    def test_list_endpoint(self):
        response = self.client.get('/api/v1/houses/')
        self.assertEqual(response.status_code, 200)
