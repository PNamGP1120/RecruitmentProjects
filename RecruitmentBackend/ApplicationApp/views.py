from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Application, ApplicationStatus, InterviewStatus, Interview
from .serializers import (
    ApplicationSerializer,
    ApplicationAcceptOfferSerializer, InterviewSerializer
)
from .permissions import IsJobSeeker, IsRecruiter, IsAuthenticatedAndApproved


class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticatedAndApproved]

    def get_queryset(self):
        user = self.request.user
        if user.active_role.name == 'JobSeeker':
            return Application.objects.filter(job_seeker=user)
        if user.active_role.name == 'Recruiter':
            return Application.objects.filter(job_posting__recruiter=user)
        return Application.objects.all()

    def perform_create(self, serializer):
        serializer.save(job_seeker=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsJobSeeker])
    def withdraw(self, request, pk=None):
        application = self.get_object()
        if application.status != ApplicationStatus.APPLIED:
            return Response({'detail': 'Không thể rút hồ sơ khi đã chuyển bước.'}, status=400)
        application.status = ApplicationStatus.WITHDRAWN
        application.save()
        return Response({'status': 'Withdrawn'})

    @action(detail=True, methods=['post'], permission_classes=[IsRecruiter])
    def offer(self, request, pk=None):
        application = self.get_object()
        application.status = ApplicationStatus.OFFERED
        application.save()
        return Response({'status': 'Offered'})

    @action(detail=True, methods=['post'], permission_classes=[IsRecruiter])
    def reject(self, request, pk=None):
        application = self.get_object()
        application.status = ApplicationStatus.REJECTED
        application.save()
        return Response({'status': 'Rejected'})

    @action(detail=True, methods=['post'], permission_classes=[IsJobSeeker])
    def accept_offer(self, request, pk=None):
        application = self.get_object()
        serializer = ApplicationAcceptOfferSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if application.status != ApplicationStatus.OFFERED:
            return Response({'detail': 'Chỉ có thể chấp nhận nếu đã được mời.'}, status=400)
        application.status = ApplicationStatus.HIRED
        application.save()
        return Response({'status': 'Hired'})

    @action(detail=False, methods=['get'], permission_classes=[IsRecruiter])
    def recruiter_applications(self, request):
        job_posting_id = request.query_params.get('job_posting')
        apps = Application.objects.filter(job_posting__recruiter=request.user, job_posting_id=job_posting_id)
        serializer = self.get_serializer(apps, many=True)
        return Response(serializer.data)


class InterviewViewSet(viewsets.ModelViewSet):
    queryset = Interview.objects.all()
    serializer_class = InterviewSerializer
    permission_classes = [IsAuthenticatedAndApproved]

    def get_queryset(self):
        user = self.request.user
        if user.active_role.name == 'Recruiter':
            return Interview.objects.filter(application__job_posting__recruiter_profile__user=user)
        elif user.active_role.name == 'JobSeeker':
            return Interview.objects.filter(application__job_seeker=user)
        return Interview.objects.all()

    def perform_create(self, serializer):
        import uuid
        jitsi_link = f"https://meet.jit.si/recruitment-{uuid.uuid4().hex[:8]}"
        serializer.save(location=jitsi_link)

    @action(detail=True, methods=['post'], permission_classes=[IsRecruiter])
    def cancel(self, request, pk=None):
        interview = self.get_object()
        interview.status = InterviewStatus.CANCELED
        interview.save()
        return Response({'status': 'Canceled'})

    @action(detail=True, methods=['post'], permission_classes=[IsRecruiter])
    def complete(self, request, pk=None):
        interview = self.get_object()
        interview.status = InterviewStatus.COMPLETED
        interview.save()
        return Response({'status': 'Completed'})