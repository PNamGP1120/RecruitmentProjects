from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
import re
from .models import Role, UserRole

User = get_user_model()

def validate_password_strength(value):
    min_length = 8
    if len(value) < min_length:
        raise ValidationError(f'Mật khẩu phải có ít nhất {min_length} ký tự.')
    if not re.search(r'[A-Z]', value):
        raise ValidationError('Mật khẩu phải chứa ít nhất một chữ hoa.')
    if not re.search(r'[a-z]', value):
        raise ValidationError('Mật khẩu phải chứa ít nhất một chữ thường.')
    if not re.search(r'\d', value):
        raise ValidationError('Mật khẩu phải chứa ít nhất một số.')
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
        raise ValidationError('Mật khẩu phải chứa ít nhất một ký tự đặc biệt.')
    return value

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'description']

class UserRoleSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    approved_by = serializers.CharField(source='approved_by.username', read_only=True)

    class Meta:
        model = UserRole
        fields = ['id', 'role', 'is_approved', 'approved_at', 'approved_by']

class UserSerializer(serializers.ModelSerializer):
    roles = RoleSerializer(many=True, read_only=True)
    active_role = RoleSerializer(read_only=True)
    avatar_url = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar_url', 'roles', 'active_role', 'is_verified', 'is_active']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Mật khẩu xác nhận không khớp."})
        validate_password_strength(attrs['password'])
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        jobseeker_role = Role.objects.get(name=Role.JOB_SEEKER)
        UserRole.objects.create(user=user, role=jobseeker_role, is_approved=True)
        user.active_role = jobseeker_role
        user.save()
        return user

class ActiveRoleSerializer(serializers.Serializer):
    role_id = serializers.UUIDField()

    def validate_role_id(self, value):
        user = self.context['request'].user
        if not user.user_roles.filter(role__id=value, is_approved=True).exists():
            raise serializers.ValidationError("Bạn không có vai trò này hoặc chưa được duyệt.")
        return value

    def save(self, **kwargs):
        user = self.context['request'].user
        role = Role.objects.get(id=self.validated_data['role_id'])
        user.active_role = role
        user.save()
        return user

class RequestRecruiterRoleSerializer(serializers.Serializer):
    # Không cần trường nào, chỉ dùng để gửi yêu cầu
    def save(self, **kwargs):
        user = self.context['request'].user
        recruiter_role = Role.objects.get(name=Role.RECRUITER)
        if UserRole.objects.filter(user=user, role=recruiter_role).exists():
            raise serializers.ValidationError("Bạn đã gửi yêu cầu hoặc đã là nhà tuyển dụng.")
        UserRole.objects.create(user=user, role=recruiter_role, is_approved=False)
        return {"detail": "Yêu cầu trở thành Nhà tuyển dụng đã được gửi. Vui lòng chờ admin duyệt."}
