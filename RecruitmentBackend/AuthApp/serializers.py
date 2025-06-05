from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from django.contrib.auth import authenticate
from .models import MyUser, Role, UserRole

# Đăng ký user
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = MyUser
        fields = ('username', 'email', 'password', 'password2', 'avatar')

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Password và Confirm Password không khớp")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = MyUser.objects.create(**validated_data)
        user.set_password(password)
        user.save()

        jobseeker_role = Role.objects.get(name='JobSeeker')
        UserRole.objects.create(user=user, role=jobseeker_role, is_approved=True)
        return user

# Đăng nhập
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Sai tên đăng nhập hoặc mật khẩu")
        if not user.is_active:
            raise serializers.ValidationError("Tài khoản không hoạt động")
        return {'user': user}

# Thông tin người dùng
class UserSerializer(serializers.ModelSerializer):
    roles = serializers.StringRelatedField(many=True)
    avatar_url = serializers.ReadOnlyField()

    class Meta:
        model = MyUser
        fields = ('id', 'username', 'first_name', 'last_name','email', 'avatar_url', 'roles', 'active_role')

# Đổi mật khẩu
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Mật khẩu cũ không đúng")
        return value

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.last_password_change = timezone.now()
        user.save()
        return user

# Yêu cầu role mới
class UserRoleRequestSerializer(serializers.Serializer):
    role_name = serializers.CharField()

    def validate_role_name(self, value):
        if value not in [Role.JOB_SEEKER, Role.RECRUITER]:
            raise serializers.ValidationError("Chỉ được yêu cầu role JobSeeker hoặc Recruiter")
        return value

# Hiển thị UserRole
class UserRoleSerializer(serializers.ModelSerializer):
    role = serializers.StringRelatedField()

    class Meta:
        model = UserRole
        fields = ('id', 'role', 'is_approved', 'approved_at', 'approved_by')

# Xác thực email gửi
class EmailVerifySendSerializer(serializers.Serializer):
    email = serializers.EmailField()

# Xác nhận email
class EmailVerifyConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()

# Password reset request
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

# Password reset confirm
class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

# Upload avatar
class AvatarUploadSerializer(serializers.Serializer):
    avatar = serializers.ImageField()
