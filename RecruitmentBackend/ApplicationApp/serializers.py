from rest_framework import serializers
from .models import Application, Interview, ApplicationStatus, InterviewStatus
from ResumeApp.models import Resume
from JobApp.models import JobPosting


class ApplicationSerializer(serializers.ModelSerializer):
    job_seeker = serializers.PrimaryKeyRelatedField(read_only=True)
    job_posting = serializers.PrimaryKeyRelatedField(queryset=JobPosting.objects.all())
    resume = serializers.PrimaryKeyRelatedField(queryset=Resume.objects.all(), required=False, allow_null=True)

    job_posting_title = serializers.CharField(source='job_posting.title', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Application
        fields = [
            'id',
            'job_seeker',
            'job_posting',
            'job_posting_title',
            'resume',
            'status',
            'status_display',
            'applied_at',
            'updated_at',
            'cover_letter'
        ]
        read_only_fields = ['status', 'applied_at', 'updated_at']


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['status']


class ApplicationAcceptOfferSerializer(serializers.Serializer):
    confirm = serializers.BooleanField()

    def validate_confirm(self, value):
        if not value:
            raise serializers.ValidationError("Bạn phải xác nhận để chấp nhận lời mời làm việc.")
        return value


class InterviewSerializer(serializers.ModelSerializer):
    application = serializers.PrimaryKeyRelatedField(queryset=Application.objects.all())
    job_posting_title = serializers.CharField(source='application.job_posting.title', read_only=True)
    job_seeker_username = serializers.CharField(source='application.job_seeker.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Interview
        fields = [
            'id',
            'application',
            'job_posting_title',
            'job_seeker_username',
            'scheduled_at',
            'location',
            'status',
            'status_display',
            'notes',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['location', 'status', 'created_at', 'updated_at']

class InterviewStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interview
        fields = ['status']
