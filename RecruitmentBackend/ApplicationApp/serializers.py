from rest_framework import serializers
from .models import Application, Interview
from JobApp.serializers import JobPostingSerializer
from ResumeApp.serializers import ResumeSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class ApplicationSerializer(serializers.ModelSerializer):
    job_seeker = serializers.StringRelatedField(read_only=True)  # hiển thị tên user
    job_posting = JobPostingSerializer(read_only=True)
    resume = ResumeSerializer(read_only=True)
    job_posting_id = serializers.UUIDField(write_only=True)
    resume_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    status = serializers.CharField(read_only=True)
    applied_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Application
        fields = [
            'id',
            'job_seeker',
            'job_posting',
            'job_posting_id',
            'resume',
            'resume_id',
            'status',
            'applied_at',
            'updated_at',
            'cover_letter',
        ]

    def validate_job_posting_id(self, value):
        from JobApp.models import JobPosting
        if not JobPosting.objects.filter(id=value).exists():
            raise serializers.ValidationError("JobPosting không tồn tại.")
        return value

    def validate_resume_id(self, value):
        from ResumeApp.models import Resume
        if value is not None and not Resume.objects.filter(id=value).exists():
            raise serializers.ValidationError("Resume không tồn tại.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        job_posting_id = validated_data.pop('job_posting_id')
        resume_id = validated_data.pop('resume_id', None)

        from JobApp.models import JobPosting
        from ResumeApp.models import Resume

        job_posting = JobPosting.objects.get(id=job_posting_id)
        resume = Resume.objects.get(id=resume_id) if resume_id else None

        # Tạo Application với user hiện tại làm job_seeker
        application = Application.objects.create(
            job_seeker=user,
            job_posting=job_posting,
            resume=resume,
            **validated_data
        )
        return application

class InterviewSerializer(serializers.ModelSerializer):
    application_id = serializers.UUIDField(write_only=True)
    # Có thể thêm nested application info nếu muốn
    application = ApplicationSerializer(read_only=True)

    status = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Interview
        fields = [
            'id',
            'application_id',
            'scheduled_at',
            'location',
            'status',
            'notes',
            'created_at',
            'updated_at',
        ]

    def validate_application_id(self, value):
        if not Application.objects.filter(id=value).exists():
            raise serializers.ValidationError("Application không tồn tại.")
        return value

    def create(self, validated_data):
        application_id = validated_data.pop('application_id')
        application = Application.objects.get(id=application_id)
        validated_data['application'] = application
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)
