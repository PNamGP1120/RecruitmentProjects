from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Application, ApplicationStatus, Interview
from .serializers import ApplicationSerializer, InterviewSerializer
from .permissions import IsJobSeeker, IsRecruiter, IsOwnerOrAdmin

class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user

        if user.user_roles.filter(role__name='Admin', is_approved=True).exists():
            return Application.objects.all()

        if user.user_roles.filter(role__name='Recruiter', is_approved=True).exists():
            # TODO: Lọc ứng tuyển thuộc công ty của recruiter
            return Application.objects.all()

        if user.user_roles.filter(role__name='JobSeeker', is_approved=True).exists():
            return Application.objects.filter(job_seeker=user)

        return Application.objects.none()

    def perform_create(self, serializer):
        serializer.save(job_seeker=self.request.user)

    def perform_update(self, serializer):
        app = self.get_object()
        user = self.request.user

        # Kiểm tra quyền update (chủ sở hữu hoặc admin)
        if user != app.job_seeker and not user.user_roles.filter(role__name='Admin', is_approved=True).exists():
            raise PermissionDenied("Bạn không có quyền chỉnh sửa đơn này.")

        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if user != instance.job_seeker and not user.user_roles.filter(role__name='Admin', is_approved=True).exists():
            raise PermissionDenied("Bạn không có quyền xóa đơn này.")
        instance.delete()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        app = self.get_object()
        new_status = request.data.get('status')
        valid_statuses = [choice[0] for choice in ApplicationStatus.choices]
        user = request.user

        if new_status not in valid_statuses:
            return Response({'error': 'Trạng thái không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)

        # Người tìm việc chỉ được rút hồ sơ
        if user.user_roles.filter(role__name='JobSeeker', is_approved=True).exists():
            if new_status != ApplicationStatus.WITHDRAWN:
                return Response({'error': 'Bạn chỉ có thể rút hồ sơ'}, status=status.HTTP_403_FORBIDDEN)
            if app.job_seeker != user:
                return Response({'error': 'Bạn không có quyền cập nhật đơn này'}, status=status.HTTP_403_FORBIDDEN)

        # Nhà tuyển dụng cập nhật các trạng thái khác (ngoại trừ rút hồ sơ)
        elif user.user_roles.filter(role__name='Recruiter', is_approved=True).exists():
            if new_status == ApplicationStatus.WITHDRAWN:
                return Response({'error': 'Không thể cập nhật trạng thái này'}, status=status.HTTP_403_FORBIDDEN)
            # TODO: Kiểm tra ứng tuyển thuộc công ty nhà tuyển dụng

        else:
            return Response({'error': 'Bạn không có quyền truy cập'}, status=status.HTTP_403_FORBIDDEN)

        app.status = new_status
        app.save()
        serializer = self.get_serializer(app)
        return Response(serializer.data)


class InterviewViewSet(viewsets.ModelViewSet):
    serializer_class = InterviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.user_roles.filter(role__name='Recruiter', is_approved=True).exists():
            # TODO: lọc các cuộc phỏng vấn thuộc công ty recruiter
            return Interview.objects.all()

        elif user.user_roles.filter(role__name='JobSeeker', is_approved=True).exists():
            return Interview.objects.filter(application__job_seeker=user)

        return Interview.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if not user.user_roles.filter(role__name='Recruiter', is_approved=True).exists():
            raise PermissionDenied("Chỉ nhà tuyển dụng được tạo cuộc phỏng vấn.")
        serializer.save()

    def perform_update(self, serializer):
        interview = self.get_object()
        user = self.request.user
        if not (
            user == interview.application.job_seeker or
            user.user_roles.filter(role__name='Recruiter', is_approved=True).exists() or
            user.user_roles.filter(role__name='Admin', is_approved=True).exists()
        ):
            raise PermissionDenied("Bạn không có quyền chỉnh sửa phỏng vấn này.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if not (
            user == instance.application.job_seeker or
            user.user_roles.filter(role__name='Recruiter', is_approved=True).exists() or
            user.user_roles.filter(role__name='Admin', is_approved=True).exists()
        ):
            raise PermissionDenied("Bạn không có quyền xóa phỏng vấn này.")
        instance.delete()