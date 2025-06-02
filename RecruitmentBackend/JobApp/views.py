from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import RecruiterProfile, JobPosting
from .serializers import (
    RecruiterProfileSerializer,
    JobPostingSerializer,
    JobPostingRecommendSerializer,
    JobTypeSerializer,
    JobStatusSerializer,
)
from .permissions import (
    IsAdmin,
    IsRecruiter,
    IsJobSeeker,
    IsAuthenticatedAndApproved,
    IsOwnerOrAdmin,
    IsRecruiterOwnerOrAdmin,
)


class RecruiterProfileViewSet(viewsets.ModelViewSet):
    queryset = RecruiterProfile.objects.all()
    serializer_class = RecruiterProfileSerializer

    def get_permissions(self):
        if self.action == "list":
            permission_classes = [IsAuthenticatedAndApproved & (IsAdmin | IsRecruiter)]
        elif self.action in ["retrieve", "update", "partial_update", "destroy"]:
            permission_classes = [IsOwnerOrAdmin]
        elif self.action == "create":
            permission_classes = [IsRecruiter]
        else:
            permission_classes = [IsAuthenticatedAndApproved]
        return [perm() for perm in permission_classes]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class JobPostingViewSet(viewsets.ModelViewSet):
    queryset = JobPosting.objects.all()
    serializer_class = JobPostingSerializer
    lookup_field = 'slug'  # Sử dụng slug thay cho id
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['job_type', 'location', 'status']
    search_fields = ['title', 'description', 'requirements', 'location']
    ordering_fields = ['created_at', 'salary_min', 'views_count']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ["list", "retrieve", "increment_view"]:
            permission_classes = [AllowAny]
        elif self.action == "recommend":
            permission_classes = [IsJobSeeker]
        elif self.action == "create":
            permission_classes = [IsRecruiter]
        elif self.action in ["update", "partial_update", "destroy", "submit_for_approval"]:
            permission_classes = [IsRecruiterOwnerOrAdmin]
        else:
            permission_classes = [IsAuthenticatedAndApproved]
        return [perm() for perm in permission_classes]

    def get_queryset(self):
        """
        Lọc việc làm theo quyền của người dùng:
        - Admin: Xem tất cả tin tuyển dụng
        - Recruiter: Xem tin tuyển dụng của chính họ
        - JobSeeker: Chỉ xem tin đã duyệt (Approved)
        """
        user = self.request.user

        # Nếu user là admin
        if user.is_superuser:
            return JobPosting.objects.all()

        # Nếu user là recruiter, chỉ xem việc làm của chính họ
        elif hasattr(user, 'recruiter_profile'):
            return JobPosting.objects.filter(recruiter_profile__user=user)

        # Nếu user là job seeker, chỉ xem việc làm đã duyệt (Approved)
        elif hasattr(user, 'job_seeker_profile'):
            return JobPosting.objects.filter(status='Approved')

        # Nếu không phải các vai trò trên, trả về rỗng
        return JobPosting.objects.filter(status='Approved')

    def perform_create(self, serializer):
        recruiter_profile = getattr(self.request.user, 'recruiter_profile', None)
        if not recruiter_profile:
            return Response({'detail': 'Bạn không phải nhà tuyển dụng hoặc chưa tạo hồ sơ tuyển dụng.'},
                            status=status.HTTP_400_BAD_REQUEST)
        serializer.save(recruiter_profile=recruiter_profile, status='Draft')

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def increment_view(self, request, slug=None):
        job = self.get_object()
        job.views_count += 1
        job.save()
        return Response({"views_count": job.views_count})

    @action(detail=True, methods=['post'])
    def submit_for_approval(self, request, slug=None):
        job = self.get_object()
        if job.recruiter_profile.user != request.user:
            return Response({"detail": "Bạn không có quyền gửi duyệt tin này."}, status=status.HTTP_403_FORBIDDEN)
        if job.status != "Draft":
            return Response({"detail": "Chỉ có thể gửi duyệt từ trạng thái bản nháp."}, status=status.HTTP_400_BAD_REQUEST)
        job.status = "Pending"
        job.save()
        return Response({"detail": "Đã gửi yêu cầu duyệt tin tuyển dụng."})


class AdminJobApprovalViewSet(viewsets.ViewSet):
    permission_classes = [IsAdmin]

    def list(self, request):
        jobs = JobPosting.objects.filter(status="Pending")
        serializer = JobPostingSerializer(jobs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, slug=None):
        try:
            job = JobPosting.objects.get(slug=slug, status="Pending")
        except JobPosting.DoesNotExist:
            return Response({"detail": "Tin tuyển dụng không tồn tại hoặc không ở trạng thái chờ duyệt."},
                            status=status.HTTP_404_NOT_FOUND)
        job.status = "Approved"
        job.save()
        return Response({"detail": "Tin tuyển dụng đã được duyệt."})

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, slug=None):
        try:
            job = JobPosting.objects.get(slug=slug, status="Pending")
        except JobPosting.DoesNotExist:
            return Response({"detail": "Tin tuyển dụng không tồn tại hoặc không ở trạng thái chờ duyệt."},
                            status=status.HTTP_404_NOT_FOUND)
        job.status = "Rejected"
        job.save()
        return Response({"detail": "Tin tuyển dụng đã bị từ chối."})


class RecruiterJobsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = JobPostingSerializer
    permission_classes = [IsOwnerOrAdmin]

    def get_queryset(self):
        recruiter_id = self.kwargs.get('recruiter_id')
        return JobPosting.objects.filter(recruiter_profile__id=recruiter_id)


from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .models import JobType, JobStatus
from .serializers import JobTypeSerializer, JobStatusSerializer, JobPostingRecommendSerializer
from django.db.models import Q

class JobTypeListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        choices = [{'value': c[0], 'label': c[1]} for c in JobType.choices]
        print(choices)
        serializer = JobTypeSerializer(choices, many=True)
        return Response(serializer.data)


class JobStatusListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        choices = [{'value': c[0], 'label': c[1]} for c in JobStatus.choices]
        serializer = JobStatusSerializer(choices, many=True)
        return Response(serializer.data)


class JobRecommendAPIView(APIView):
    permission_classes = [IsJobSeeker]

    def get(self, request):
        user = request.user
        jobseeker_profile = getattr(user, 'job_seeker_profile', None)
        if not jobseeker_profile:
            return Response({"detail": "Bạn chưa có hồ sơ người tìm việc."}, status=status.HTTP_400_BAD_REQUEST)

        skills = [skill.name.lower() for skill in jobseeker_profile.skills.all()]
        filters = Q(is_active=True, status="Approved")
        if skills:
            skill_filters = Q()
            for skill in skills:
                skill_filters |= Q(description__icontains=skill) | Q(requirements__icontains=skill)
            filters &= skill_filters

        recommended_jobs = JobPosting.objects.filter(filters).order_by('-created_at')[:10]
        serializer = JobPostingRecommendSerializer(recommended_jobs, many=True)
        return Response(serializer.data)
