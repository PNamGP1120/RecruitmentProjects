import re
from difflib import SequenceMatcher

from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework.exceptions import PermissionDenied

from .models import Role, UserRole, JobSeekerProfile, RecruiterProfile, Skill, CV, JobPosting, Message, Conversation

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
        }

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Tên người dùng này đã tồn tại.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email này đã tồn tại.")
        return value

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password2": "Mật khẩu không khớp."})

        password = data['password']

        if len(password) < 8:
            raise serializers.ValidationError("Mật khẩu phải có ít nhất 8 ký tự.")

        if not (re.search(r'[A-Z]', password) and re.search(r'\d', password) and re.search(r'[\W_]', password)):
            raise serializers.ValidationError(
                "Mật khẩu phải có ít nhất 8 ký tự, bao gồm một chữ hoa, một số và một ký tự đặc biệt."
            )

        user_temp = User(username=data['username'], email=data['email'])
        if any(
            SequenceMatcher(None, password.lower(), getattr(user_temp, attr, '').lower()).quick_ratio() >= 0.7
            for attr in ['username', 'email'] if getattr(user_temp, attr, '')
        ):
            raise serializers.ValidationError("Mật khẩu quá giống với tên người dùng hoặc email.")

        validate_password(password)
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

class UserUpdateSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'avatar']
        extra_kwargs = {
            'username': {'required': False},
            'email': {'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def validate_email(self, value):
        user = self.instance
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("Email đã được sử dụng.")
        return value

    def validate_username(self, value):
        user = self.instance
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError("Tên đăng nhập đã tồn tại.")
        return value

class UserRoleSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.role_name', read_only=True)
    role_description = serializers.CharField(source='role.description', read_only=True)  # nếu có trường mô tả

    class Meta:
        model = UserRole
        fields = ['id', 'role_name', 'role_description', 'is_approved', 'approved_at']

class CurrentUserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    active_role = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'avatar_url', 'last_name', 'active_role', 'roles']

    def get_roles(self, obj):
        user_roles = obj.user_roles.all()
        return UserRoleSerializer(user_roles, many=True).data

    def get_active_role(self, obj):
        if obj.active_role:
            return obj.active_role.role_name
        return None

    def get_avatar_url(self, obj):
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return obj.avatar.url
        return None


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'role_name']


class JobSeekerRegisterSerializer(serializers.ModelSerializer):
    """
        Serializer cho hồ sơ người tìm việc (NTV).
        skills được xử lý dưới dạng danh sách các ID Skill.
        """
    skills = serializers.PrimaryKeyRelatedField(queryset=Skill.objects.all(), many=True, required=False)

    class Meta:
        model = JobSeekerProfile
        fields = ['summary', 'experience', 'education', 'skills', 'phone_number', 'date_of_birth', 'gender']

    def update(self, instance, validated_data):
        skills = validated_data.pop('skills', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if skills is not None:
            instance.skills.set(skills)
        instance.save()
        return instance

    def create(self, validated_data):
        skills = validated_data.pop('skills', None)
        profile = JobSeekerProfile.objects.create(**validated_data)
        if skills:
            profile.skills.set(skills)
        return profile


class RecruiterRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer cho hồ sơ nhà tuyển dụng (NTD).
    Hỗ trợ upload ảnh logo công ty.
    """
    company_logo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = RecruiterProfile
        fields = ['company_name', 'company_website', 'company_description', 'industry', 'address', 'company_logo']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['my_user'] = user  # đúng theo model, là my_user (không phải user)
        recruiter_profile = RecruiterProfile.objects.create(**validated_data)
        return recruiter_profile

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['company_logo_url'] = instance.company_logo.url if instance.company_logo else None
        return rep

class AdminApproveRecruiterSerializer(serializers.Serializer):
    user_role_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )
    is_approved = serializers.BooleanField(default=True)


class AdminAssignAdminRoleSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()


class UserRoleApproveSerializer(serializers.Serializer):
    user_role_ids = serializers.ListField(child=serializers.UUIDField() if isinstance(UserRole._meta.pk, serializers.UUIDField) else serializers.IntegerField())
    is_approved = serializers.BooleanField()


class SwitchRoleSerializer(serializers.Serializer):
    role_name = serializers.CharField(max_length=50)

class JobPostingSerializer(serializers.ModelSerializer):
    recruiter_name = serializers.CharField(source='recruiter_profile.company_name', read_only=True)
    recruiter_logo_url = serializers.SerializerMethodField()

    class Meta:
        model = JobPosting
        fields = [
            'id', 'slug', 'title', 'description', 'location', 'salary_min', 'salary_max',
            'job_type', 'status', 'is_active', 'expiration_date',
            'recruiter_name', 'recruiter_logo_url'
        ]
        read_only_fields = ['id', 'slug', 'status', 'is_active', 'recruiter_name', 'recruiter_logo_url']

    def get_recruiter_logo_url(self, obj):
        if obj.recruiter_profile.company_logo:
            return obj.recruiter_profile.company_logo.url
        return None

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

class JobPostingCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        fields = [
            'title', 'description', 'location', 'salary_min', 'salary_max',
            'job_type', 'expiration_date', 'experience_required'
        ]

    def validate(self, data):
        # Bạn có thể thêm validate logic ở đây nếu cần
        return data

class ConversationSerializer(serializers.ModelSerializer):
    user1 = serializers.StringRelatedField()  # Hiển thị tên người tham gia
    user2 = serializers.StringRelatedField()

    class Meta:
        model = Conversation
        fields = ['id', 'user1', 'user2', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.StringRelatedField(read_only=True)  # Người gửi, chỉ đọc
    recipient = serializers.StringRelatedField(read_only=True)  # Người nhận, chỉ đọc
    conversation = serializers.StringRelatedField(read_only=True)  # Cuộc hội thoại, chỉ đọc

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'recipient', 'content', 'attachment', 'is_read', 'read_at', 'created_at']

    def create(self, validated_data):
        """
        Tạo tin nhắn mới và gán người gửi (sender) từ người dùng đã đăng nhập,
        người nhận sẽ được lấy tự động từ cuộc hội thoại.
        """
        sender = self.context['request'].user  # Gán người gửi là người đã đăng nhập
        conversation = validated_data['conversation']  # Cuộc hội thoại từ validated_data

        # Xác định người nhận là người còn lại trong cuộc hội thoại 1-1
        recipient = conversation.user1 if conversation.user2 == sender else conversation.user2

        # Tạo tin nhắn, không truyền lại 'sender' và 'recipient' từ validated_data
        message = Message.objects.create(
            sender=sender,  # Gán sender từ người dùng đã đăng nhập
            recipient=recipient,  # Xác định recipient từ cuộc hội thoại
            **validated_data  # Gán các trường khác từ validated_data
        )

        return message

    def update(self, instance, validated_data):
        """
        Cập nhật trạng thái tin nhắn (chẳng hạn như đánh dấu là đã đọc)
        """
        if 'is_read' in validated_data:
            instance.is_read = validated_data['is_read']
            if validated_data['is_read']:
                instance.read_at = timezone.now()  # Gán thời gian đọc khi đánh dấu là đã đọc
            else:
                instance.read_at = None  # Nếu không phải là đã đọc, set read_at = None

        # Cập nhật các trường khác
        return super().update(instance, validated_data)

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

    def create(self, validated_data):
        user = self.context['request'].user

        # Lấy hồ sơ JobSeekerProfile từ user
        # Phòng khi user không phải là JobSeeker (ví dụ là Recruiter) → để kiểm soát lỗi.
        job_seeker_profile = getattr(user, 'job_seeker_profile', None)
        if not job_seeker_profile:
            raise serializers.ValidationError("User không có hồ sơ người tìm việc.")

        # Gán profile cho CV mới để liên kết giữa CV và người dùng
        validated_data['job_seeker_profile'] = job_seeker_profile

        # Nếu is_default=True, tắt mặc định cho các CV còn lại
        if validated_data.get('is_default', False):
            CV.objects.filter(job_seeker_profile=job_seeker_profile, is_default=True).update(is_default=False)

        return super().create(validated_data)

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['file_path'] = instance.file_path.url if instance.file_path else None
        return rep

class CVUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CV
        fields = ['file_name', 'version_name', 'is_default']

    def update(self, instance, validated_data):
        user = self.context['request'].user

        # Kiểm tra quyền sở hữu
        job_seeker_profile = getattr(user, 'job_seeker_profile', None)
        if not job_seeker_profile or instance.job_seeker_profile != job_seeker_profile:
            raise PermissionDenied("You do not have permission to update this CV.")

        # Nếu cập nhật is_default=True thì các CV khác phải tắt
        if validated_data.get('is_default', False):
            CV.objects.filter(
                job_seeker_profile=job_seeker_profile,
                is_default=True
            ).exclude(id=instance.id).update(is_default=False)

        return super().update(instance, validated_data)
