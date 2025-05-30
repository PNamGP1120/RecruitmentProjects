from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import RecruiterProfile, JobPosting, JobStatus
from .serializers import RecruiterProfileSerializer, JobPostingSerializer
from .permissions import IsRecruiter, IsAdmin, IsOwnerOrAdmin


class RecruiterProfileView(APIView):
    permission_classes = [IsAuthenticated, IsRecruiter]

    def get(self, request):
        profile, _ = RecruiterProfile.objects.get_or_create(user=request.user)
        serializer = RecruiterProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile, _ = RecruiterProfile.objects.get_or_create(user=request.user)
        serializer = RecruiterProfileSerializer(profile, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request):
        profile, _ = RecruiterProfile.objects.get_or_create(user=request.user)
        serializer = RecruiterProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class JobPostingViewSet(viewsets.ModelViewSet):
    serializer_class = JobPostingSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        user = self.request.user
        queryset = JobPosting.objects.all()

        # Lọc tin cho public chỉ xem tin đã duyệt và đang active
        if not user.is_authenticated or not (
            user.user_roles.filter(role__name='Recruiter', is_approved=True).exists() or
            user.user_roles.filter(role__name='Admin', is_approved=True).exists()
        ):
            queryset = queryset.filter(status=JobStatus.APPROVED, is_active=True)

        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'submit_for_review', 'activate']:
            permission_classes = [IsAuthenticated, IsRecruiter, IsOwnerOrAdmin]
        elif self.action in ['approve', 'reject']:
            permission_classes = [IsAuthenticated, IsAdmin]
        else:
            permission_classes = []  # Public xem list, detail
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        recruiter_profile = getattr(self.request.user, 'recruiter_profile', None)
        if not recruiter_profile:
            raise PermissionError("Người dùng chưa có hồ sơ nhà tuyển dụng.")
        serializer.save(
            recruiter_profile=recruiter_profile,
            status=JobStatus.DRAFT,
            is_active=False,
        )

    @action(detail=True, methods=['post'])
    def submit_for_review(self, request, slug=None):
        job = self.get_object()
        if job.status != JobStatus.DRAFT:
            return Response({"detail": "Chỉ tin nháp mới có thể gửi duyệt."}, status=status.HTTP_400_BAD_REQUEST)
        job.status = JobStatus.PENDING
        job.save()
        return Response({"detail": "Tin đã được gửi để chờ duyệt."})

    @action(detail=True, methods=['post'])
    def approve(self, request, slug=None):
        job = self.get_object()
        if job.status != JobStatus.PENDING:
            return Response({"detail": "Tin phải ở trạng thái chờ duyệt."}, status=status.HTTP_400_BAD_REQUEST)
        job.status = JobStatus.APPROVED
        job.is_active = True
        job.save()
        return Response({"detail": "Tin tuyển dụng đã được duyệt."})

    @action(detail=True, methods=['post'])
    def reject(self, request, slug=None):
        job = self.get_object()
        if job.status != JobStatus.PENDING:
            return Response({"detail": "Tin phải ở trạng thái chờ duyệt."}, status=status.HTTP_400_BAD_REQUEST)
        job.status = JobStatus.REJECTED
        job.is_active = False
        job.save()
        return Response({"detail": "Tin tuyển dụng đã bị từ chối."})

    @action(detail=True, methods=['post'])
    def activate(self, request, slug=None):
        job = self.get_object()
        job.is_active = not job.is_active
        job.save()
        return Response({'is_active': job.is_active})
