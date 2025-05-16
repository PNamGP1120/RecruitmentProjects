from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Role, UserRole, JobSeekerProfile, RecruiterProfile
from .serializers import (
    RegisterSerializer, UserUpdateSerializer, JobSeekerRegisterSerializer,
    RecruiterRegisterSerializer, RoleSerializer, UserRoleApproveSerializer,
    SwitchRoleSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class UserUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class JobSeekerRegisterView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = JobSeekerRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        skills = data.pop('skills', None)

        profile, created = JobSeekerProfile.objects.update_or_create(
            my_user=request.user,
            defaults=data
        )

        if skills is not None:
            profile.skills.set(skills)

        role = Role.objects.get(role_name=Role.JobSeeker)
        user_role, _ = UserRole.objects.get_or_create(
            my_user=request.user,
            role=role,
            defaults={'is_approved': True, 'approved_by': request.user, 'approved_at': timezone.now()}
        )

        request.user.active_role = role
        request.user.save()

        return Response({
            "message": "Đăng ký Người tìm việc thành công",
            "active_role": role.role_name
        })


class RecruiterRegisterView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = RecruiterRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        profile, created = RecruiterProfile.objects.update_or_create(
            my_user=request.user,
            defaults=serializer.validated_data
        )

        role = Role.objects.get(role_name=Role.Recruiter)
        user_role, created = UserRole.objects.get_or_create(
            my_user=request.user,
            role=role,
            defaults={'is_approved': False}
        )
        # Không cập nhật active_role, chờ admin duyệt

        return Response({
            "message": "Đăng ký Nhà tuyển dụng thành công, chờ admin phê duyệt"
        })


class AdminApproveRecruiterView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = UserRoleApproveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_role_ids = serializer.validated_data['user_role_ids']
        is_approved = serializer.validated_data['is_approved']

        role_recruiter = Role.objects.get(role_name=Role.Recruiter)
        approved_roles = []

        for ur_id in user_role_ids:
            try:
                user_role = UserRole.objects.get(pk=ur_id, role=role_recruiter)
                user = user_role.my_user

                # Kiểm tra user đã có hồ sơ nhà tuyển dụng chưa
                if not RecruiterProfile.objects.filter(my_user=user).exists():
                    # Bỏ qua nếu chưa có hồ sơ
                    continue

                # Cập nhật trạng thái phê duyệt
                user_role.is_approved = is_approved
                user_role.approved_at = timezone.now()
                user_role.approved_by = request.user
                user_role.save()

                # Nếu phê duyệt, cập nhật active_role user
                if is_approved:
                    user.active_role = role_recruiter
                    user.save()

                approved_roles.append({
                    "user_role_id": str(user_role.pk),
                    "user_id": str(user.pk),
                    "active_role": user_role.role.role_name,
                    "status": "approved" if is_approved else "rejected",
                    "approved_at": user_role.approved_at.isoformat() if user_role.approved_at else None,
                })

            except UserRole.DoesNotExist:
                continue

        return Response({
            "message": f"Phê duyệt thành công {len(approved_roles)} nhà tuyển dụng",
            "approved_roles": approved_roles
        })

class AdminAssignAdminRoleView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        user_id = request.data.get('user_id')
        try:
            user = User.objects.get(pk=user_id)
            role = Role.objects.get(role_name=Role.Admin)
            user_role, created = UserRole.objects.get_or_create(
                my_user=user,
                role=role,
                defaults={'is_approved': True, 'approved_by': request.user, 'approved_at': timezone.now()}
            )
            user.active_role = role
            user.save()

            return Response({
                "message": "Gán quyền Admin thành công",
                "user_id": user.pk,
                "active_role": role.role_name
            })

        except User.DoesNotExist:
            return Response({"error": "User không tồn tại"}, status=404)


class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class RoleListView(generics.ListAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.AllowAny]


class SwitchRoleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SwitchRoleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        role_name = serializer.validated_data['role_name']
        try:
            role = Role.objects.get(role_name=role_name)
            user_role = UserRole.objects.get(my_user=request.user, role=role, is_approved=True)

            request.user.active_role = role
            request.user.save()

            return Response({"message": "Chuyển đổi vai trò thành công", "active_role": role.role_name})

        except (Role.DoesNotExist, UserRole.DoesNotExist):
            return Response({"error": "Vai trò không hợp lệ hoặc chưa được phê duyệt"}, status=400)
