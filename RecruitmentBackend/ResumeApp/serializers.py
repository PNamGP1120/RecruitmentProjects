from rest_framework import serializers
from .models import Skill, JobSeekerProfile, Resume

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'description']
        read_only_fields = ['id']

class JobSeekerProfileSerializer(serializers.ModelSerializer):
    # Hiển thị kỹ năng chi tiết khi đọc
    skills = SkillSerializer(many=True, read_only=True)
    # Cho phép ghi danh sách ID skill khi tạo/cập nhật
    skills_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Skill.objects.all(),
        write_only=True,
        source='skills'
    )
    user = serializers.StringRelatedField(read_only=True)  # Hiển thị username thay vì id

    class Meta:
        model = JobSeekerProfile
        fields = [
            'id', 'user', 'summary', 'experience', 'education',
            'skills', 'skills_ids', 'phone_number', 'date_of_birth', 'gender'
        ]
        read_only_fields = ['id', 'user']

    def create(self, validated_data):
        skills = validated_data.pop('skills', [])
        profile = JobSeekerProfile.objects.create(**validated_data)
        profile.skills.set(skills)
        return profile

    def update(self, instance, validated_data):
        skills = validated_data.pop('skills', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if skills is not None:
            instance.skills.set(skills)
        instance.save()
        return instance

class ResumeSerializer(serializers.ModelSerializer):
    job_seeker = serializers.StringRelatedField(read_only=True)  # Hiển thị username hồ sơ

    class Meta:
        model = Resume
        fields = ['id', 'job_seeker', 'title', 'file', 'is_active', 'created_at']
        read_only_fields = ['id', 'job_seeker', 'created_at']

    def create(self, validated_data):
        # create gọi từ viewset với job_seeker được set thủ công trong perform_create
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)
