from collections import defaultdict
from decimal import Decimal
from statistics import mean

from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone

from apps.registrations.models import Registration
from apps.infrastructure.selectors import settings_object

from .models import JudgeAssignment, JudgeScore, Result
from .validators import validate_marks


def point_settings():
    settings = settings_object()
    return {
        'first': Decimal(str(settings.first_place_points)),
        'second': Decimal(str(settings.second_place_points)),
        'third': Decimal(str(settings.third_place_points)),
        'participation': Decimal(str(settings.participation_points)),
    }


class ScoreCalculator:
    @staticmethod
    def final_score(scores):
        if not scores:
            return Decimal('0')
        return Decimal(str(mean([float(score) for score in scores]))).quantize(Decimal('0.01'))

    @staticmethod
    def rank_results(results):
        sorted_results = sorted(results, key=lambda item: item.final_score, reverse=True)
        rank = 0
        last_score = None
        display_position = 0
        for index, result in enumerate(sorted_results, start=1):
            if last_score is None or result.final_score != last_score:
                rank = index
                display_position = index
            result.rank = rank
            result.position = display_position
            last_score = result.final_score
        return sorted_results

    @staticmethod
    def house_points_for_position(position: int):
        settings_map = point_settings()
        if position == 1:
            return settings_map['first']
        if position == 2:
            return settings_map['second']
        if position == 3:
            return settings_map['third']
        return settings_map['participation']


class JudgingService:
    @staticmethod
    def submit_score(*, registration: Registration, judge, marks, remarks='', user=None) -> JudgeScore:
        event = registration.event
        assignment_exists = JudgeAssignment.objects.filter(event=event, judge=judge, is_active=True).exists()
        if not assignment_exists:
            raise ValidationError('Only assigned judges can submit marks.')
        if Result.objects.filter(registration=registration, published_status=True).exists():
            raise ValidationError('Published results are read only.')
        validate_marks(marks, event.maximum_marks)
        score, created = JudgeScore.objects.get_or_create(
            registration=registration,
            judge=judge,
            defaults={
                'marks': marks,
                'remarks': remarks,
                'created_by': user,
                'updated_by': user,
            },
        )
        if not created:
            score.marks = marks
            score.remarks = remarks
            score.updated_by = user
            score.save(update_fields=['marks', 'remarks', 'updated_by', 'updated_at'])
        return score

    @staticmethod
    def build_results_for_event(event):
        registrations = Registration.objects.filter(event=event).select_related('student', 'student__house')
        results = []
        for registration in registrations:
            judge_scores = JudgeScore.objects.filter(registration=registration)
            marks = [score.marks for score in judge_scores]
            final_score = ScoreCalculator.final_score(marks)
            result, _ = Result.objects.get_or_create(registration=registration)
            result.final_score = final_score
            result.save()
            results.append(result)
        ranked = ScoreCalculator.rank_results(results)
        for result in ranked:
            result.house_points = ScoreCalculator.house_points_for_position(result.position)
            result.save(update_fields=['rank', 'position', 'house_points', 'updated_at'])
        return ranked

    @staticmethod
    def publish_results(event, user=None):
        results = JudgingService.build_results_for_event(event)
        if not results:
            raise ValidationError('No results available to publish.')
        required_judges = event.number_of_judges
        for registration in Registration.objects.filter(event=event):
            judge_count = JudgeScore.objects.filter(registration=registration).values('judge').distinct().count()
            if judge_count < required_judges:
                raise ValidationError('Results cannot be published until all required judges have submitted marks.')
        for result in results:
            result.published_status = True
            result.published_at = timezone.now()
            result.save(update_fields=['published_status', 'published_at', 'updated_at'])
        event.status = event.StatusChoices.PUBLISHED
        event.updated_by = user
        event.save(update_fields=['status', 'updated_by', 'updated_at'])
        return results

    @staticmethod
    def recalculate_results(event):
        return JudgingService.build_results_for_event(event)

    @staticmethod
    def leaderboard():
        from apps.houses.models import House

        points = defaultdict(lambda: {'total_house_points': Decimal('0'), 'gold_count': 0, 'silver_count': 0, 'bronze_count': 0, 'participation_count': 0})
        published_results = Result.objects.filter(published_status=True).select_related('registration__student__house')
        for result in published_results:
            house = result.registration.student.house
            bucket = points[house.id]
            bucket['house'] = house
            bucket['total_house_points'] += result.house_points
            bucket['participation_count'] += 1
            if result.position == 1:
                bucket['gold_count'] += 1
            elif result.position == 2:
                bucket['silver_count'] += 1
            elif result.position == 3:
                bucket['bronze_count'] += 1
        leaderboard = []
        for bucket in points.values():
            house = bucket['house']
            leaderboard.append({
                'house_id': house.id,
                'house_name': house.name,
                'house_code': house.code,
                'house_color': house.color,
                'total_house_points': bucket['total_house_points'],
                'gold_count': bucket['gold_count'],
                'silver_count': bucket['silver_count'],
                'bronze_count': bucket['bronze_count'],
                'participation_count': bucket['participation_count'],
            })
        leaderboard.sort(key=lambda item: (-item['total_house_points'], -item['gold_count'], -item['silver_count'], -item['bronze_count'], item['house_name']))
        return leaderboard
