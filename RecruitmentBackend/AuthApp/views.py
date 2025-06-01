from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings

from .models import MyUser, Role, UserRole
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer, ChangePasswordSerializer,
    UserRoleRequestSerializer, UserRoleSerializer, EmailVerifySendSerializer,
    EmailVerifyConfirmSerializer, PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    AvatarUploadSerializer
)
from .permissions import IsAdminUser

class AuthViewSet(viewsets.GenericViewSet):
    """
    ViewSet cho các API đăng ký, đăng nhập, user info, đổi mật khẩu, upload avatar,...
    """
    queryset = MyUser.objects.all()

    def get_permissions(self):
        if self.action in ['register', 'login', 'token_refresh', 'email_verify_send', 'email_verify_confirm', 'password_reset_request', 'password_reset_confirm']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'register':
            return RegisterSerializer
        elif self.action == 'login':
            return LoginSerializer
        elif self.action == 'user_info':
            return UserSerializer
        elif self.action == 'change_password':
            return ChangePasswordSerializer
        elif self.action == 'avatar_upload':
            return AvatarUploadSerializer
        elif self.action == 'email_verify_send':
            return EmailVerifySendSerializer
        elif self.action == 'email_verify_confirm':
            return EmailVerifyConfirmSerializer
        elif self.action == 'password_reset_request':
            return PasswordResetRequestSerializer
        elif self.action == 'password_reset_confirm':
            return PasswordResetConfirmSerializer
        else:
            return UserSerializer

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
        })

    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data,
        })

    @action(detail=False, methods=['get'])
    def user_info(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['put', 'patch'])
    def update_user(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Đổi mật khẩu thành công."})

    @action(detail=False, methods=['post'])
    def avatar_upload(self, request):
        serializer = AvatarUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.avatar = serializer.validated_data['avatar']
        request.user.save()
        return Response({"avatar_url": request.user.avatar.url})

    @action(detail=False, methods=['get'])
    def avatar(self, request):
        user = request.user
        avatar_url = user.avatar.url if user.avatar else settings.STATIC_URL + 'images/default_avatar.png'
        return Response({"avatar_url": avatar_url})

    # Email verify & password reset giả lập
    @action(detail=False, methods=['post'])
    def email_verify_send(self, request):
        serializer = EmailVerifySendSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        token = "dummy-token"
        send_mail(
            'Xác thực email',
            f'Link xác thực: https://your-domain.com/verify-email/{token}',
            settings.DEFAULT_FROM_EMAIL,
            [email],
        )
        return Response({"detail": "Email xác thực đã được gửi."})

    @action(detail=False, methods=['post'])
    def email_verify_confirm(self, request):
        serializer = EmailVerifyConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({"detail": "Email đã được xác thực."})

    @action(detail=False, methods=['post'])
    def password_reset_request(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({"detail": "Yêu cầu đặt lại mật khẩu đã được gửi."})

    @action(detail=False, methods=['post'])
    def password_reset_confirm(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({"detail": "Mật khẩu đã được đặt lại."})

class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Role.objects.all()
    permission_classes = [AllowAny]
    lookup_field = 'name'

    def list(self, request, *args, **kwargs):
        roles = Role.objects.all()
        data = [{'name': r.name, 'description': r.description} for r in roles]
        return Response(data)

class UserRoleViewSet(viewsets.GenericViewSet, mixins.ListModelMixin):
    serializer_class = UserRoleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserRole.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def request_role(self, request):
        serializer = UserRoleRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        role_name = serializer.validated_data['role_name']
        role = Role.objects.get(name=role_name)
        if UserRole.objects.filter(user=request.user, role=role).exists():
            return Response({"detail": "Bạn đã gửi yêu cầu hoặc có role này rồi"}, status=400)
        UserRole.objects.create(user=request.user, role=role, is_approved=False)
        return Response({"detail": f"Yêu cầu role {role_name} đã được gửi."}, status=201)

    @action(detail=False, methods=['patch'])
    def activate(self, request):
        role_name = request.data.get('role_name')
        if not role_name:
            return Response({"detail": "Cần cung cấp role_name."}, status=400)
        try:
            role = Role.objects.get(name=role_name)
            user_role = UserRole.objects.get(user=request.user, role=role, is_approved=True)
        except Exception:
            return Response({"detail": "Role không tồn tại hoặc chưa được duyệt."}, status=400)
        user = request.user
        user.active_role = role
        user.save()
        return Response({"detail": f"Đã chuyển sang role {role_name}."})

class AdminUserRoleViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = UserRoleSerializer

    @action(detail=False, methods=['get'])
    def pending(self, request):
        qs = UserRole.objects.filter(is_approved=False)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def approve(self, request):
        role_ids = request.data.get('role_ids', [])
        if not isinstance(role_ids, list) or not role_ids:
            return Response({"detail": "Cần danh sách role_ids."}, status=400)
        user_roles = UserRole.objects.filter(id__in=role_ids, is_approved=False)
        for ur in user_roles:
            ur.is_approved = True
            ur.approved_at = timezone.now()
            ur.approved_by = request.user
            ur.save()
        return Response({"detail": f"Đã duyệt {user_roles.count()} yêu cầu."})

    @action(detail=False, methods=['post'])
    def assign_admin(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"detail": "Cần user_id."}, status=400)
        try:
            user = MyUser.objects.get(id=user_id)
            role = Role.objects.get(name='Admin')
            user_role, created = UserRole.objects.get_or_create(user=user, role=role)
            user_role.is_approved = True
            user_role.approved_at = timezone.now()
            user_role.approved_by = request.user
            user_role.save()
        except Exception as e:
            return Response({"detail": str(e)}, status=400)
        return Response({"detail": "Đã gán role Admin."})