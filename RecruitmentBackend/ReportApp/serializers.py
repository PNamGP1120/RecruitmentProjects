from rest_framework import serializers
from uuid import UUID

# 1,2,3 - Báo cáo Nhà tuyển dụng
class RecruiterJobBasicStatSerializer(serializers.Serializer):
    job_id = serializers.UUIDField()
    job_title = serializers.CharField()
    total_applications = serializers.IntegerField()
    hired_count = serializers.IntegerField()
    interview_completed = serializers.IntegerField()
    hired_ratio = serializers.FloatField(allow_null=True)

class RecruiterJobPerformanceSerializer(serializers.Serializer):
    job_id = serializers.UUIDField()
    job_title = serializers.CharField()
    views_count = serializers.IntegerField()
    total_applications = serializers.IntegerField()
    avg_time_to_hire_days = serializers.IntegerField(allow_null=True)

class RecruiterApplicantStatusSerializer(serializers.Serializer):
    job_id = serializers.UUIDField()
    job_title = serializers.CharField()
    status_counts = serializers.DictField(
        child=serializers.IntegerField()
    )

# 4 - Lịch sử hoạt động (giả định có model ActivityLog)
class ActivityLogSerializer(serializers.Serializer):
    action = serializers.CharField()
    target = serializers.CharField()
    timestamp = serializers.DateTimeField()

# 5 - Tổng lượt xem hồ sơ của người tìm việc
class JobSeekerResumeViewsSerializer(serializers.Serializer):
    user = serializers.CharField()
    total_resume_views = serializers.IntegerField()
    total_applications = serializers.IntegerField()
    total_job_posting_views = serializers.IntegerField()

# 6 - Tỉ lệ phản hồi nhà tuyển dụng
class JobSeekerResponseRateSerializer(serializers.Serializer):
    user = serializers.CharField()
    total_applications = serializers.IntegerField()
    responses = serializers.IntegerField()
    response_rate = serializers.FloatField()

# 7 - Lịch sử ứng tuyển chi tiết
class JobSeekerApplicationHistorySerializer(serializers.Serializer):
    job_title = serializers.CharField()
    status = serializers.CharField()
    applied_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()
    cover_letter = serializers.CharField(allow_null=True, allow_blank=True)

# 8 - Gợi ý công việc
class JobSuggestionSerializer(serializers.Serializer):
    job_id = serializers.UUIDField()
    title = serializers.CharField()
    company = serializers.CharField()
    location = serializers.CharField()

# 9 - Tổng quan hệ thống
class UserCountSerializer(serializers.Serializer):
    active_role__name = serializers.CharField()
    count = serializers.IntegerField()

class SystemSummarySerializer(serializers.Serializer):
    user_counts = UserCountSerializer(many=True)
    total_jobs = serializers.IntegerField()
    total_applications = serializers.IntegerField()

# 10 - Xu hướng tuyển dụng theo thời gian
class JobTrendSerializer(serializers.Serializer):
    month = serializers.DateTimeField(required=False, allow_null=True)
    week = serializers.DateTimeField(required=False, allow_null=True)
    count = serializers.IntegerField()

# 11 - Báo cáo thông báo hệ thống
class SystemNotificationReportSerializer(serializers.Serializer):
    total_notifications = serializers.IntegerField()
    read_notifications = serializers.IntegerField()
    unread_notifications = serializers.IntegerField()
    counts_by_type = serializers.ListField(child=serializers.DictField())

# 12 - Báo cáo tùy chỉnh (dữ liệu tùy thuộc)
class CustomReportSerializer(serializers.Serializer):
    # Dùng serializer generic để serialize dữ liệu linh hoạt
    data = serializers.JSONField()

# 13 - Xuất báo cáo (không cần serializer, trả file trực tiếp)

# 14 - Chỉ số KPI tùy chỉnh
class CustomMetricsSerializer(serializers.Serializer):
    average_applications_per_job = serializers.FloatField(allow_null=True)
    overall_hired_ratio = serializers.FloatField()
