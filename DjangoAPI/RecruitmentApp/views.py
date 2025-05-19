from django.db import models
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status, serializers
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.tokens import RefreshToken

from .permissions import IsAuthenticated, AllowAnyUser, IsAdmin, IsJobSeeker, IsRecruiterWithProfile, IsSuperAdmin
from .models import Role, UserRole, JobSeekerProfile, RecruiterProfile, CV, MyUser, JobPosting, Conversation, Message
from .permissions import IsAdmin
from .serializers import (
    RegisterSerializer, UserUpdateSerializer, JobSeekerRegisterSerializer,
    RecruiterRegisterSerializer, RoleSerializer, UserRoleApproveSerializer,
    SwitchRoleSerializer, JobSeekerProfileSerializer, RecruiterProfileSerializer, CVSerializer, CVUpdateSerializer,
    LoginSerializer, CurrentUserSerializer, AdminApproveRecruiterSerializer, JobPostingCreateUpdateSerializer,
    JobPostingSerializer, AdminAssignAdminRoleSerializer, ConversationSerializer, MessageSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAnyUser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "username": user.username,
            "email": user.email,
            "active_role": None,
            "message": "Đăng ký thành công. Vui lòng đăng nhập để tiếp tục."
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAnyUser]  # Cho phép mọi người đăng nhập

    @staticmethod
    def post(request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        user = authenticate(username=username, password=password)
        if user is None:
            return Response({"detail": "Tên đăng nhập hoặc mật khẩu không đúng."}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })

class UserUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = CurrentUserSerializer(request.user)
        return Response(serializer.data)

class RoleListView(generics.ListAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [AllowAnyUser]

class JobSeekerRegisterView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data.copy()
        skills = data.pop('skills', None)

        serializer = JobSeekerProfileSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        profile, created = JobSeekerProfile.objects.update_or_create(
            my_user=request.user,
            defaults=serializer.validated_data
        )

        # Role JobSeeker
        jobseeker_role = Role.objects.get(role_name='JobSeeker')
        UserRole.objects.update_or_create(
            my_user=request.user,
            role=jobseeker_role,
            defaults={
                'is_approved': True,
                'approved_at': timezone.now(),
                'approved_by': request.user
            }
        )

        if skills is not None:
            profile.skills.set(skills)

        request.user.active_role = jobseeker_role
        request.user.save()

        return Response({
            "message": "Đăng ký Người tìm việc thành công",
            "active_role": jobseeker_role.role_name
        }, status=status.HTTP_200_OK)


class RecruiterRegisterView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = RecruiterProfileSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        profile, created = RecruiterProfile.objects.update_or_create(
            my_user=request.user,
            defaults=serializer.validated_data
        )

        # Tạo hoặc cập nhật role Recruiter, chưa phê duyệt
        recruiter_role = Role.objects.get(role_name='Recruiter')
        UserRole.objects.update_or_create(
            my_user=request.user,
            role=recruiter_role,
            defaults={'is_approved': False}
        )

        return Response({
            "message": "Đăng ký Nhà tuyển dụng thành công, chờ admin phê duyệt"
        }, status=status.HTTP_200_OK)


class AdminApproveRecruiterView(APIView):
    permission_classes = [IsAdmin]  # hoặc custom permission IsSuperAdmin

    def post(self, request):
        serializer = AdminApproveRecruiterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_role_ids = serializer.validated_data['user_role_ids']
        is_approved = serializer.validated_data['is_approved']

        recruiter_role = Role.objects.get(role_name='Recruiter')
        approved_roles = []
        for ur_id in user_role_ids:
            try:
                user_role = UserRole.objects.get(id=ur_id, role=recruiter_role)
            except UserRole.DoesNotExist:
                continue  # hoặc trả lỗi 404 tùy yêu cầu

            user_role.is_approved = is_approved
            if is_approved:
                user_role.approved_at = timezone.now()
                user_role.approved_by = request.user
                # Cập nhật active_role cho user
                user = user_role.my_user
                user.active_role = recruiter_role
                user.save()
            else:
                user_role.approved_at = None
                user_role.approved_by = None
            user_role.save()

            approved_roles.append({
                "user_role_id": ur_id,
                "user_id": user_role.my_user.id,
                "active_role": recruiter_role.role_name if is_approved else None,
                "status": "approved" if is_approved else "unapproved"
            })

        return Response({
            "message": f"Phê duyệt thành công {len(approved_roles)} nhà tuyển dụng",
            "approved_roles": approved_roles
        }, status=status.HTTP_200_OK)


class AdminAssignAdminRoleView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        serializer = AdminAssignAdminRoleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_id = serializer.validated_data['user_id']

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

        admin_role = Role.objects.get(role_name='Admin')

        user_role, created = UserRole.objects.update_or_create(
            my_user=user,
            role=admin_role,
            defaults={
                'is_approved': True,
                'approved_at': timezone.now(),
                'approved_by': request.user
            }
        )

        user.active_role = admin_role
        user.save()

        return Response({
            "message": "Gán quyền Admin thành công",
            "user_id": user.id,
            "active_role": admin_role.role_name
        }, status=status.HTTP_200_OK)


class SwitchRoleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SwitchRoleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        role_name = serializer.validated_data['role_name']
        user = request.user

        try:
            role = Role.objects.get(role_name=role_name)
        except Role.DoesNotExist:
            return Response({"detail": "Vai trò không tồn tại."}, status=status.HTTP_400_BAD_REQUEST)

        user_role = UserRole.objects.filter(my_user=user, role=role, is_approved=True).first()
        if not user_role:
            return Response({"detail": "Bạn không có quyền chuyển sang vai trò này hoặc chưa được phê duyệt."},
                            status=status.HTTP_403_FORBIDDEN)

        user.active_role = role
        user.save()

        return Response({
            "message": "Chuyển đổi vai trò thành công",
            "active_role": role.role_name
        }, status=status.HTTP_200_OK)

class JobPostingViewSet(ModelViewSet):
    queryset = JobPosting.objects.all()
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'send_for_approval', 'close']:
            return [IsAuthenticated(), IsRecruiterWithProfile()]
        elif self.action in ['approve', 'reject']:
            return [IsAuthenticated(), IsAdmin()]
        elif self.action in ['list', 'retrieve']:
            return [AllowAny()]
        else:
            return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return JobPostingCreateUpdateSerializer
        return JobPostingSerializer

    def get_queryset(self):
        user = self.request.user
        if self.action in ['list', 'retrieve']:
            return JobPosting.objects.filter(status='approved', is_active=True)

        if user.is_authenticated and user.active_role and user.active_role.role_name == 'Recruiter':
            try:
                recruiter_profile = user.recruiter_profile
                return JobPosting.objects.filter(recruiter_profile=recruiter_profile)
            except AttributeError:
                return JobPosting.objects.none()

        if user.is_authenticated and user.active_role and user.active_role.role_name == 'Admin':
            return JobPosting.objects.all()

        return JobPosting.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        try:
            recruiter_profile = user.recruiter_profile
        except AttributeError:
            raise PermissionDenied("Bạn chưa có hồ sơ nhà tuyển dụng.")
        serializer.save(recruiter_profile=recruiter_profile, status='draft', is_active=True)

    def perform_update(self, serializer):
        job_posting = self.get_object()
        if job_posting.recruiter_profile != self.request.user.recruiter_profile:
            raise PermissionDenied("Bạn không có quyền chỉnh sửa bài đăng này.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.recruiter_profile != self.request.user.recruiter_profile:
            raise PermissionDenied("Bạn không có quyền xóa bài đăng này.")
        instance.delete()

    @action(detail=True, methods=['post'])
    def send_for_approval(self, request, slug=None):
        job_posting = self.get_object()
        if job_posting.status != 'draft':
            return Response({'detail': 'Chỉ có thể gửi phê duyệt bài đang ở trạng thái nháp.'}, status=status.HTTP_400_BAD_REQUEST)
        job_posting.status = 'pending_approval'
        job_posting.save()
        return Response({'detail': 'Đã gửi yêu cầu phê duyệt.'})

    @action(detail=True, methods=['post'])
    def approve(self, request, slug=None):
        if not request.user.active_role or request.user.active_role.role_name != 'Admin':
            raise PermissionDenied("Chỉ admin mới có quyền phê duyệt.")
        job_posting = self.get_object()
        if job_posting.status != 'pending_approval':
            return Response({'detail': 'Chỉ có thể phê duyệt bài đang chờ duyệt.'}, status=status.HTTP_400_BAD_REQUEST)
        job_posting.status = 'approved'
        job_posting.save()
        return Response({'detail': 'Phê duyệt bài đăng thành công.'})

    @action(detail=True, methods=['post'])
    def close(self, request, slug=None):
        job_posting = self.get_object()
        if job_posting.recruiter_profile != self.request.user.recruiter_profile:
            raise PermissionDenied("Bạn không có quyền đóng bài đăng này.")
        if job_posting.status not in ['draft', 'approved']:
            return Response({'detail': 'Chỉ có thể đóng bài đang ở trạng thái nháp hoặc đã phê duyệt.'}, status=status.HTTP_400_BAD_REQUEST)
        job_posting.status = 'closed'
        job_posting.is_active = False
        job_posting.save()
        return Response({'detail': 'Bài đăng đã được đóng.'})

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, slug=None):
        if not request.user.active_role or request.user.active_role.role_name != 'Admin':
            raise PermissionDenied("Chỉ admin mới có quyền từ chối.")
        job_posting = self.get_object()
        if job_posting.status != 'pending_approval':
            return Response({"detail": "Chỉ có bài đang chờ phê duyệt mới có thể từ chối."}, status=status.HTTP_400_BAD_REQUEST)
        job_posting.status = 'draft'
        job_posting.save()
        return Response({"detail": "Bài đăng đã bị từ chối và chuyển về trạng thái nháp."}, status=status.HTTP_200_OK)

class ConversationViewSet(ModelViewSet):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(user1=user) | Conversation.objects.filter(user2=user)

    def perform_create(self, serializer):
        user = self.request.user
        user2_id = self.request.data.get('user2')  # Nhận ID của user2 từ request data

        # Kiểm tra xem cuộc hội thoại đã tồn tại chưa
        existing_conversation = Conversation.objects.filter(
            (models.Q(user1=user) & models.Q(user2=user2_id)) |
            (models.Q(user1=user2_id) & models.Q(user2=user))
        ).first()

        if existing_conversation:
            raise serializers.ValidationError("Conversation already exists!")

        # Tạo cuộc hội thoại mới
        serializer.save(user1=user, user2_id=user2_id)
        return Response(serializer.data)

class MessageViewSet(ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Trả về danh sách tin nhắn trong cuộc hội thoại cụ thể
        """
        conversation_id = self.kwargs['conversation_id']
        return Message.objects.filter(conversation__id=conversation_id)

    def perform_create(self, serializer):
        """
        Tạo tin nhắn mới, gán người gửi (sender) từ người đăng nhập
        """
        conversation_id = self.kwargs['conversation_id']
        try:
            conversation = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            raise serializers.ValidationError("Conversation does not exist!")

        # Không cần phải truyền sender ở đây, vì serializer đã tự động gán sender
        serializer.save(conversation=conversation)
        return Response(serializer.data)

    def perform_update(self, serializer):
        """
        Cập nhật trạng thái tin nhắn (đánh dấu là đã đọc) chỉ khi người nhận tin nhắn thực hiện hành động
        """
        message = self.get_object()

        # Kiểm tra xem người dùng hiện tại có phải là người nhận tin nhắn không
        if message.recipient != self.request.user:
            raise PermissionDenied("You are not the recipient of this message.")

        # Cập nhật trạng thái is_read và thời gian đọc
        if 'is_read' in self.request.data and self.request.data['is_read'] is True:
            serializer.save(is_read=True, read_at=timezone.now())
        else:
            serializer.save()

        return Response(serializer.data)

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
