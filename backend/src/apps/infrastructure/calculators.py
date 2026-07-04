from collections import defaultdict

from django.db.models import Count, Sum

from apps.judging.models import Result


class DashboardCalculator:
    @staticmethod
    def house_rankings():
        from apps.houses.models import House

        houses = list(House.objects.all())
        totals = defaultdict(int)
        for result in Result.objects.filter(published_status=True).select_related('registration__student__house'):
            totals[result.registration.student.house_id] += int(result.house_points or 0)
        ranking = []
        for house in houses:
            ranking.append({
                'house_id': house.id,
                'house_name': house.name,
                'house_code': house.code,
                'total_house_points': totals[house.id],
            })
        ranking.sort(key=lambda item: (-item['total_house_points'], item['house_name']))
        for index, item in enumerate(ranking, start=1):
            item['rank'] = index
        return ranking

