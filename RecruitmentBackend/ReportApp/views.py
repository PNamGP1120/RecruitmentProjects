from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .services import (
    get_recruiter_stats,
    get_recruiter_job_performance,
    get_recruiter_applicant_status,
    get_recruiter_activity_log,
    get_jobseeker_resume_views,
    get_jobseeker_response_rate,
    get_jobseeker_application_history,
    get_jobseeker_job_suggestions,
    get_system_summary,
    get_system_trends,
    get_system_notifications_report,
    generate_custom_report,
    export_report_to_file,
    get_custom_metrics,
)
from .permissions import IsRecruiter, IsJobSeeker, IsAdminUser
from .serializers import (
    RecruiterJobBasicStatSerializer,
    RecruiterJobPerformanceSerializer,
    RecruiterApplicantStatusSerializer,
    ActivityLogSerializer,
    JobSeekerResumeViewsSerializer,
    JobSeekerResponseRateSerializer,
    JobSeekerApplicationHistorySerializer,
    JobSuggestionSerializer,
    SystemSummarySerializer,
    JobTrendSerializer,
    SystemNotificationReportSerializer,
    CustomReportSerializer,
    CustomMetricsSerializer,
)
from django.http import HttpResponse


class RecruiterStatsView(APIView):
    permission_classes = [IsAuthenticated, IsRecruiter]

    def get(self, request):
        data = get_recruiter_stats(request.user)
        serializer = RecruiterJobBasicStatSerializer(data, many=True)
        return Response(serializer.data)


class RecruiterJobPerformanceView(APIView):
    permission_classes = [IsAuthenticated, IsRecruiter]

    def get(self, request):
        data = get_recruiter_job_performance(request.user)
        serializer = RecruiterJobPerformanceSerializer(data, many=True)
        return Response(serializer.data)


class RecruiterApplicantStatusView(APIView):
    permission_classes = [IsAuthenticated, IsRecruiter]

    def get(self, request):
        data = get_recruiter_applicant_status(request.user)
        serializer = RecruiterApplicantStatusSerializer(data, many=True)
        return Response(serializer.data)


class RecruiterActivityLogView(APIView):
    permission_classes = [IsAuthenticated, IsRecruiter]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        data = get_recruiter_activity_log(request.user, days)
        serializer = ActivityLogSerializer(data, many=True)
        return Response(serializer.data)


class JobSeekerResumeViewsView(APIView):
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def get(self, request):
        data = get_jobseeker_resume_views(request.user)
        serializer = JobSeekerResumeViewsSerializer(data)
        return Response(serializer.data)


class JobSeekerResponseRateView(APIView):
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def get(self, request):
        data = get_jobseeker_response_rate(request.user)
        serializer = JobSeekerResponseRateSerializer(data)
        return Response(serializer.data)


class JobSeekerApplicationHistoryView(APIView):
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def get(self, request):
        data = get_jobseeker_application_history(request.user)
        serializer = JobSeekerApplicationHistorySerializer(data, many=True)
        return Response(serializer.data)


class JobSeekerJobSuggestionsView(APIView):
    permission_classes = [IsAuthenticated, IsJobSeeker]

    def get(self, request):
        data = get_jobseeker_job_suggestions(request.user)
        serializer = JobSuggestionSerializer(data, many=True)
        return Response(serializer.data)


class SystemSummaryView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        data = get_system_summary()
        serializer = SystemSummarySerializer(data)
        return Response(serializer.data)


class SystemTrendsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        period = request.query_params.get('period', 'month')
        data = get_system_trends(period)
        serializer = JobTrendSerializer(data, many=True)
        return Response(serializer.data)


class SystemNotificationsReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        data = get_system_notifications_report()
        serializer = SystemNotificationReportSerializer(data)
        return Response(serializer.data)


class GenerateCustomReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        params = request.data
        data = generate_custom_report(params)
        serializer = CustomReportSerializer({'data': data})
        return Response(serializer.data)


class ExportReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        report_type = request.query_params.get('type')
        file_format = request.query_params.get('format', 'excel').lower()

        if not report_type:
            return Response({'error': 'Missing "type" query parameter.'}, status=400)

        # Lấy dữ liệu báo cáo theo loại
        data = generate_custom_report({'report_type': report_type, **request.query_params})

        # Xuất file ra bytes
        file_bytes = export_report_to_file(data, file_format=file_format)
        if not file_bytes:
            return Response({'error': f'Unsupported file format: {file_format}'}, status=400)

        # Thiết lập content type theo định dạng file
        if file_format == 'excel':
            content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            file_ext = 'xlsx'
        elif file_format == 'pdf':
            content_type = 'application/pdf'
            file_ext = 'pdf'
        else:
            return Response({'error': f'Unsupported file format: {file_format}'}, status=400)

        # Trả file về client dưới dạng attachment
        response = HttpResponse(file_bytes, content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename=report.{file_ext}'

        return response


class CustomMetricsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        data = get_custom_metrics()
        serializer = CustomMetricsSerializer(data)
        return Response(serializer.data)
