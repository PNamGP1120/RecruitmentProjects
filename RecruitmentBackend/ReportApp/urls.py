from django.urls import path
from .views import (
    RecruiterStatsView,
    RecruiterJobPerformanceView,
    RecruiterApplicantStatusView,
    RecruiterActivityLogView,
    JobSeekerResumeViewsView,
    JobSeekerResponseRateView,
    JobSeekerApplicationHistoryView,
    JobSeekerJobSuggestionsView,
    SystemSummaryView,
    SystemTrendsView,
    SystemNotificationsReportView,
    GenerateCustomReportView,
    ExportReportView,
    CustomMetricsView,
)

urlpatterns = [
    # Nhà tuyển dụng
    path('recruiter/stats/', RecruiterStatsView.as_view(), name='recruiter-stats'),
    path('recruiter/job-performance/', RecruiterJobPerformanceView.as_view(), name='recruiter-job-performance'),
    path('recruiter/applicant-status/', RecruiterApplicantStatusView.as_view(), name='recruiter-applicant-status'),
    path('recruiter/activity-log/', RecruiterActivityLogView.as_view(), name='recruiter-activity-log'),

    # Người tìm việc
    path('jobseeker/resume-views/', JobSeekerResumeViewsView.as_view(), name='jobseeker-resume-views'),
    path('jobseeker/response-rate/', JobSeekerResponseRateView.as_view(), name='jobseeker-response-rate'),
    path('jobseeker/application-history/', JobSeekerApplicationHistoryView.as_view(), name='jobseeker-application-history'),
    path('jobseeker/job-suggestions/', JobSeekerJobSuggestionsView.as_view(), name='jobseeker-job-suggestions'),

    # Hệ thống/Admin
    path('system/summary/', SystemSummaryView.as_view(), name='system-summary'),
    path('system/trends/', SystemTrendsView.as_view(), name='system-trends'),
    path('system/notifications/', SystemNotificationsReportView.as_view(), name='system-notifications'),

    # Kỹ thuật / hỗ trợ
    path('generate/', GenerateCustomReportView.as_view(), name='generate-custom-report'),
    path('export/', ExportReportView.as_view(), name='export-report'),
    path('metrics/', CustomMetricsView.as_view(), name='custom-metrics'),
]
