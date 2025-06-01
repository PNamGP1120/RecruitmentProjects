from rest_framework import serializers
from .models import RecruiterProfile, JobPosting, JobType, JobStatus

class RecruiterProfileSerializer(serializers.ModelSerializer):
    # Hiển thị username của user gán recruiter (read-only)
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = RecruiterProfile
        fields = [
            'id', 'user', 'company_name', 'company_website', 'company_description',
            'industry', 'address', 'company_logo', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class JobPostingSerializer(serializers.ModelSerializer):
    recruiter_profile = RecruiterProfileSerializer(read_only=True)
    recruiter_profile_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = JobPosting
        fields = [
            'id',
            'recruiter_profile',
            'recruiter_profile_id',
            'title',
            'description',
            'requirements',
            'location',
            'salary_min',
            'salary_max',
            'job_type',
            'status',
            'is_active',
            'expiration_date',
            'views_count',
            'slug',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id', 'recruiter_profile', 'status', 'is_active',
            'views_count', 'slug', 'created_at', 'updated_at'
        ]

    def create(self, validated_data):
        recruiter_profile_id = validated_data.pop('recruiter_profile_id', None)
        if recruiter_profile_id:
            validated_data['recruiter_profile_id'] = recruiter_profile_id
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('recruiter_profile_id', None)
        return super().update(instance, validated_data)


class JobTypeSerializer(serializers.Serializer):
    value = serializers.CharField()
    label = serializers.CharField()


class JobStatusSerializer(serializers.Serializer):
    value = serializers.CharField()
    label = serializers.CharField()


class JobPostingRecommendSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        fields = [
            'id', 'title', 'location', 'salary_min', 'salary_max', 'job_type', 'slug'
        ]
