from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .permissions import IsAuthenticated, AllowAnyUser, IsAdmin, IsJobSeeker
from .models import Role, UserRole, JobSeekerProfile, RecruiterProfile, CV, MyUser
from .permissions import IsAdmin
from .serializers import (
    RegisterSerializer, UserUpdateSerializer, JobSeekerRegisterSerializer,
    RecruiterRegisterSerializer, RoleSerializer, UserRoleApproveSerializer,
    SwitchRoleSerializer, JobSeekerProfileSerializer, RecruiterProfileSerializer, CVSerializer, CVUpdateSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAnyUser]
    serializer_class = RegisterSerializer


class UserUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class JobSeekerRegisterView(APIView):
    permission_classes = [IsAuthenticated]

    @staticmethod
    def post(request):
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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAdmin]

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
    permission_classes = [IsAdmin]

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
    permission_classes = [AllowAnyUser]


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class RoleListView(generics.ListAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [AllowAnyUser]


class SwitchRoleView(APIView):
    permission_classes = [IsAuthenticated]

    @staticmethod
    def post(request):
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

class JobSeekerProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_object_or_404(JobSeekerProfile, my_user=request.user)
        serializer = JobSeekerProfileSerializer(profile)
        return Response(serializer.data)

class RecruiterProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_object_or_404(RecruiterProfile, my_user=request.user)
        serializer = RecruiterProfileSerializer(profile)
        return Response(serializer.data)

class UpdateRecruiterProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        profile = get_object_or_404(RecruiterProfile, my_user=request.user)
        serializer = RecruiterProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Nhà tuyển dụng cập nhật hồ sơ thành công!"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CVListCreateView(generics.ListCreateAPIView):
    serializer_class = CVSerializer
    permission_classes = [IsJobSeeker]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return CV.objects.filter(job_seeker_profile=self.request.user.job_seeker_profile, is_deleted=False)

    def perform_create(self, serializer):
        serializer.save(job_seeker_profile=self.request.user.job_seeker_profile)

class CVUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        user = request.user

        if user.active_role and user.active_role.role_name == Role.Recruiter:
            raise PermissionDenied("Nhà tuyển dụng không được phép chỉnh sửa CV.")

        try:
            cv = CV.objects.get(pk=pk, job_seeker_profile=user.job_seeker_profile)
        except CV.DoesNotExist:
            raise NotFound("CV không tìm thấy hoặc bị từ chối cung cấp cho người dùng hiện tại.")

        # Gán context cho serializer
        serializer = CVUpdateSerializer(cv, data=request.data, partial=False, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            "message": "Cập nhật CV thành công!",
            "cv": serializer.data
        }, status=status.HTTP_200_OK)

class CVSoftDeleteView(APIView):
    permission_classes = [IsJobSeeker]  # Chỉ người tìm việc mới được quyền xóa CV

    def post(self, request):
        cv_ids = request.data.get('cv_ids', [])
        if not isinstance(cv_ids, list) or not all(isinstance(i, int) for i in cv_ids):
            return Response({"error": "Danh sách ID không hợp lệ"}, status=status.HTTP_400_BAD_REQUEST)

        # Lọc CV chưa bị xóa thuộc về đúng người dùng hiện tại
        cvs = CV.objects.filter(
            id__in=cv_ids,
            job_seeker_profile=request.user.job_seeker_profile,
            is_deleted=False
        )

        if not cvs.exists():
            return Response({"message": "Không có CV hợp lệ để xóa."}, status=status.HTTP_404_NOT_FOUND)

        count = 0
        for cv in cvs:
            cv.is_deleted = True
            cv.save()
            count += 1

        return Response({
            "message": f"Đã xóa thành công {count} CV.",
            "deleted_ids": [cv.id for cv in cvs]
        }, status=status.HTTP_200_OK)

class CVSetDefaultView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, cv_id):
        profile = request.user.job_seeker_profile

        # Tìm CV thuộc về user và chưa bị xóa
        try:
            cv = CV.objects.get(id=cv_id, job_seeker_profile=profile, is_deleted=False)
        except CV.DoesNotExist:
            raise NotFound("CV không tồn tại hoặc không thuộc quyền sở hữu.")

        if cv.is_default:
            return Response({"message": "CV này đã là CV mặc định."}, status=status.HTTP_200_OK)

        # Đặt tất cả CV về mặc định = False
        CV.objects.filter(job_seeker_profile=profile, is_deleted=False).update(is_default=False)

        # Đặt CV hiện tại thành mặc định
        cv.is_default = True
        cv.save()

        return Response({"message": "Cập nhật thành công: CV đã trở thành mặc định."}, status=status.HTTP_200_OK)
