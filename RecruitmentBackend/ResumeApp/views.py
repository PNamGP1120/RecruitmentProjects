from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from .models import Skill, JobSeekerProfile, Resume
from .serializers import SkillSerializer, JobSeekerProfileSerializer, ResumeSerializer
from .permissions import IsAdminUser, IsJobSeekerAndOwner, IsOwnerOrAdmin

class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated & IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

class JobSeekerProfileViewSet(viewsets.ModelViewSet):
    serializer_class = JobSeekerProfileSerializer
    permission_classes = [IsAuthenticated & (IsJobSeekerAndOwner | IsAdminUser)]
    filter_backends = [filters.SearchFilter]
    search_fields = ['summary', 'experience', 'education', 'skills__name']

    def get_queryset(self):
        user = self.request.user
        # Admin lấy tất cả hồ sơ
        if user.active_role and user.active_role.name == 'Admin':
            return JobSeekerProfile.objects.all()
        # Người tìm việc chỉ lấy hồ sơ của chính mình
        return JobSeekerProfile.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get'])
    def resumes(self, request, pk=None):
        profile = self.get_object()
        # Kiểm tra quyền sở hữu hoặc admin
        self.check_object_permissions(request, profile)
        resumes = profile.resumes.all()
        serializer = ResumeSerializer(resumes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def me(self, request):
        profile = get_object_or_404(JobSeekerProfile, user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

class ResumeViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated & (IsJobSeekerAndOwner | IsAdminUser)]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title']

    def get_queryset(self):
        user = self.request.user
        # Admin xem tất cả CV
        if user.active_role and user.active_role.name == 'Admin':
            return Resume.objects.all()
        # Người tìm việc chỉ xem CV của chính mình
        return Resume.objects.filter(job_seeker__user=user)

    def perform_create(self, serializer):
        # Gán job_seeker tự động từ user hiện tại
        job_seeker_profile = get_object_or_404(JobSeekerProfile, user=self.request.user)
        serializer.save(job_seeker=job_seeker_profile)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        resume = self.get_object()
        # Kiểm tra quyền sở hữu hoặc admin
        self.check_object_permissions(request, resume)
        # Hủy kích hoạt các CV khác cùng job_seeker
        Resume.objects.filter(job_seeker=resume.job_seeker).update(is_active=False)
        resume.is_active = True
        resume.save()
        return Response({'status': 'resume activated'}, status=status.HTTP_200_OK)
