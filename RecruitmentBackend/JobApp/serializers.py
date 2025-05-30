from rest_framework import serializers
from .models import RecruiterProfile, JobPosting, JobStatus

class RecruiterProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecruiterProfile
        fields = [
            'id',
            'company_name',
            'company_website',
            'company_description',
            'industry',
            'address',
            'company_logo',
        ]


class JobPostingSerializer(serializers.ModelSerializer):
    recruiter_profile = RecruiterProfileSerializer(read_only=True)
    slug = serializers.ReadOnlyField()
    status = serializers.CharField(read_only=True)  # Trạng thái do backend quản lý

    class Meta:
        model = JobPosting
        fields = [
            'id',
            'slug',
            'recruiter_profile',
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
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'status', 'is_active', 'views_count', 'created_at', 'updated_at',
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        recruiter_profile = getattr(request.user, 'recruiter_profile', None)
        if not recruiter_profile:
            raise serializers.ValidationError("Người dùng chưa có hồ sơ nhà tuyển dụng.")
        validated_data['recruiter_profile'] = recruiter_profile
        validated_data['status'] = JobStatus.DRAFT
        validated_data['is_active'] = False
        return super().create(validated_data)
