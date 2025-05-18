from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Role, UserRole, JobSeekerProfile, RecruiterProfile, Skill, CV

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {'password': {'write_only': True}}

    @staticmethod
    def validate(data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Mật khẩu không khớp.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    active_role = serializers.SerializerMethodField()
    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'avatar', 'avatar_url', 'active_role', 'roles']

    @staticmethod
    def get_avatar_url(obj):
        if obj.avatar:
            return obj.avatar.url
        return None

    def get_active_role(self, obj):
        if obj.active_role:
            return obj.active_role.role_name
        return None

    def get_roles(self, obj):
        user_roles = obj.user_roles.all()
        return [
            {
                "role_name": ur.role.role_name,
                "is_approved": ur.is_approved
            }
            for ur in user_roles
        ]


class JobSeekerRegisterSerializer(serializers.ModelSerializer):
    skills = serializers.PrimaryKeyRelatedField(many=True, queryset=Skill.objects.all())

    class Meta:
        model = JobSeekerProfile
        fields = ['phone_number', 'date_of_birth', 'gender', 'skills', 'summary', 'experience', 'education']


class RecruiterRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecruiterProfile
        fields = ['company_name', 'company_website', 'address', 'industry', 'company_description', 'company_logo']


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['role_name']


class UserRoleSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.role_name')
    is_approved = serializers.BooleanField()

    class Meta:
        model = UserRole
        fields = ['role_name', 'is_approved']



class UserRoleApproveSerializer(serializers.Serializer):
    user_role_ids = serializers.ListField(child=serializers.UUIDField() if isinstance(UserRole._meta.pk, serializers.UUIDField) else serializers.IntegerField())
    is_approved = serializers.BooleanField()


class SwitchRoleSerializer(serializers.Serializer):
    role_name = serializers.CharField()

class JobSeekerProfileSerializer(serializers.ModelSerializer):
    skills = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name'
    )

    class Meta:
        model = JobSeekerProfile
        fields = ['summary','experience','education',
                  'phone_number','date_of_birth','gender','skills']

class RecruiterProfileSerializer(serializers.ModelSerializer):
    company_logo_url = serializers.SerializerMethodField()

    class Meta:
        model = RecruiterProfile
        fields = ['company_name', 'company_website',
                  'address', 'industry', 'company_description', 'company_logo_url']

    @staticmethod
    def get_company_logo_url(obj):
        if obj.company_logo:
            return obj.company_logo.url
        return None

class CVSerializer(serializers.ModelSerializer):
    class Meta:
        model = CV
        fields = ['file_name', 'file_path', 'version_name', 'is_default']

    def _clear_existing_default(job_seeker_profile):
        """
        Gỡ các CV hiện tại đang đặt mặc định.
        """
        CV.objects.filter(job_seeker_profile=job_seeker_profile, is_default=True).update(is_default=False)

    def validate(self, data):
        """
        Nếu đang đặt CV này là mặc định, đảm bảo không có CV mặc định khác trừ chính nó.
        """
        is_default = data.get('is_default', False)
        request = self.context.get('request')
        job_seeker_profile = getattr(request.user, 'job_seeker_profile', None)

        if is_default and job_seeker_profile:
            existing_default = CV.objects.filter(
                job_seeker_profile=job_seeker_profile,
                is_default=True
            )
            if self.instance:
                existing_default = existing_default.exclude(id=self.instance.id)

            if existing_default.exists():
                raise serializers.ValidationError("Chỉ được phép có một CV mặc định.")
        return data

    def create(self, validated_data):
        job_seeker_profile = self.context['request'].user.job_seeker_profile
        if validated_data.get('is_default', False):
            self._clear_existing_default(job_seeker_profile)
        validated_data['job_seeker_profile'] = job_seeker_profile
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if validated_data.get('is_default', False):
            self._clear_existing_default(instance.job_seeker_profile)
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['file_path'] = instance.file_path.url if instance.file_path else None
        return rep
