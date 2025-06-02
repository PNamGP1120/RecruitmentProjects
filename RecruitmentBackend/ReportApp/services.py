from django.db.models import Count, Q, Avg, F
from ApplicationApp.models import Application, ApplicationStatus, Interview
from JobApp.models import JobPosting
from ResumeApp.models import Resume, JobSeekerProfile
from django.contrib.auth import get_user_model
from django.utils.timezone import now
from datetime import timedelta

User = get_user_model()

# 1. Thống kê hồ sơ ứng tuyển, tỉ lệ tuyển thành công, phỏng vấn hoàn thành
def get_recruiter_stats(user):
    recruiter_profile = user.recruiter_profile
    jobs = JobPosting.objects.filter(recruiter_profile=recruiter_profile)

    data = []
    for job in jobs:
        total_apps = job.applications.count()
        hired = job.applications.filter(status=ApplicationStatus.HIRED).count()
        interviewed = Interview.objects.filter(application__job_posting=job, status='Completed').count()
        data.append({
            'job_id': job.id,
            'job_title': job.title,
            'total_applications': total_apps,
            'hired_count': hired,
            'interview_completed': interviewed,
            'hired_ratio': hired / total_apps if total_apps else 0,
        })
    return data

# 2. Báo cáo hiệu quả từng tin tuyển dụng: lượt xem, lượt ứng tuyển, thời gian trung bình tuyển được
def get_recruiter_job_performance(user):
    recruiter_profile = user.recruiter_profile
    jobs = JobPosting.objects.filter(recruiter_profile=recruiter_profile)

    data = []
    for job in jobs:
        total_apps = job.applications.count()
        avg_time_to_hire = job.applications.filter(status=ApplicationStatus.HIRED).aggregate(
            avg_days=Avg(F('updated_at') - F('applied_at'))
        )['avg_days']
        data.append({
            'job_id': job.id,
            'job_title': job.title,
            'views_count': job.views_count,
            'total_applications': total_apps,
            'avg_time_to_hire_days': avg_time_to_hire.days if avg_time_to_hire else None,
        })
    return data

# 3. Tỉ lệ ứng viên theo trạng thái ứng tuyển
def get_recruiter_applicant_status(user):
    recruiter_profile = user.recruiter_profile
    jobs = JobPosting.objects.filter(recruiter_profile=recruiter_profile)

    statuses = [choice[0] for choice in ApplicationStatus.choices]
    data = []
    for job in jobs:
        counts = job.applications.values('status').annotate(count=Count('id'))
        count_dict = {status: 0 for status in statuses}
        for item in counts:
            count_dict[item['status']] = item['count']
        data.append({
            'job_id': job.id,
            'job_title': job.title,
            'status_counts': count_dict
        })
    return data

# 4. Lịch sử hoạt động tuyển dụng (giả sử có model ActivityLog, nếu không bạn cần tạo)
def get_recruiter_activity_log(user, days=30):
    # Giả sử model ActivityLog có user, action, target, timestamp
    from .models import ActivityLog  # bạn cần tạo model này trong ReportApp
    since = now() - timedelta(days=days)
    logs = ActivityLog.objects.filter(user=user, timestamp__gte=since).order_by('-timestamp')
    return logs.values('action', 'target', 'timestamp')

# 5. Tổng lượt xem hồ sơ, lượt tải CV, lượt ứng tuyển của người tìm việc
def get_jobseeker_resume_views(user):
    profile = user.job_seeker_profile
    resumes = Resume.objects.filter(job_seeker=profile)
    total_resume_views = resumes.count()  # nếu có lượt xem riêng hồ sơ, bạn nên lưu trường view count trong Resume

    applications = Application.objects.filter(job_seeker=user)
    total_applications = applications.count()
    total_job_views = sum(app.job_posting.views_count for app in applications)

    return {
        'user': user.username,
        'total_resume_views': total_resume_views,
        'total_applications': total_applications,
        'total_job_posting_views': total_job_views,
    }

# 6. Tỉ lệ phản hồi từ nhà tuyển dụng: % ứng dụng có trạng thái khác Applied hoặc Withdrawn
def get_jobseeker_response_rate(user):
    total_apps = Application.objects.filter(job_seeker=user).count()
    responded_apps = Application.objects.filter(
        job_seeker=user
    ).exclude(status__in=[ApplicationStatus.APPLIED, ApplicationStatus.WITHDRAWN]).count()
    return {
        'user': user.username,
        'total_applications': total_apps,
        'responses': responded_apps,
        'response_rate': responded_apps / total_apps if total_apps else 0,
    }

# 7. Lịch sử ứng tuyển chi tiết
def get_jobseeker_application_history(user):
    applications = Application.objects.filter(job_seeker=user).order_by('-applied_at')
    history = []
    for app in applications:
        history.append({
            'job_title': app.job_posting.title,
            'status': app.status,
            'applied_at': app.applied_at,
            'updated_at': app.updated_at,
            'cover_letter': app.cover_letter,
        })
    return history

# 8. Báo cáo gợi ý công việc phù hợp (ví dụ giả định)
def get_jobseeker_job_suggestions(user):
    # Giả lập trả về 5 công việc gợi ý dựa trên kỹ năng trong hồ sơ
    profile = user.job_seeker_profile
    skills = profile.skills.values_list('name', flat=True)
    jobs = JobPosting.objects.filter(
        status='Approved',
        description__icontains=skills.first() if skills else ''
    )[:5]
    suggestions = []
    for job in jobs:
        suggestions.append({
            'job_id': job.id,
            'title': job.title,
            'company': job.recruiter_profile.company_name if job.recruiter_profile else '',
            'location': job.location,
        })
    return suggestions

# 9. Tổng quan hệ thống: số lượng user theo vai trò, tin tuyển dụng, ứng tuyển
def get_system_summary():
    user_counts = User.objects.values('active_role__name').annotate(count=Count('id'))
    total_jobs = JobPosting.objects.count()
    total_applications = Application.objects.count()
    return {
        'user_counts': list(user_counts),
        'total_jobs': total_jobs,
        'total_applications': total_applications,
    }

# 10. Xu hướng tuyển dụng theo thời gian (tuần, tháng)
def get_system_trends(period='month'):
    # Ví dụ đếm số tin tuyển dụng theo tháng
    from django.db.models.functions import TruncMonth, TruncWeek
    if period == 'month':
        jobs_trends = JobPosting.objects.annotate(month=TruncMonth('created_at')).values('month').annotate(count=Count('id')).order_by('month')
    elif period == 'week':
        jobs_trends = JobPosting.objects.annotate(week=TruncWeek('created_at')).values('week').annotate(count=Count('id')).order_by('week')
    else:
        jobs_trends = []
    return list(jobs_trends)

# 11. Thống kê hiệu quả các thông báo (giả định bạn có model Notification với trạng thái)
def get_system_notifications_report():
    from NotificationApp.models import Notification

    total_notifications = Notification.objects.count()
    read_notifications = Notification.objects.filter(is_read=True).count()
    unread_notifications = Notification.objects.filter(is_read=False).count()

    # Thống kê theo loại thông báo
    type_counts = Notification.objects.values('notification_type').annotate(count=Count('id'))


    return {
        'total_notifications': total_notifications,
        'read_notifications': read_notifications,
        'unread_notifications': unread_notifications,
        'counts_by_type': list(type_counts),
    }


# 12. Khởi tạo báo cáo tùy chỉnh (nhận params từ client)
def generate_custom_report(params):
    # Ví dụ params có thể gồm 'user_id', 'job_id', 'date_from', 'date_to', 'report_type'
    # Viết logic tùy theo report_type để gọi hàm phù hợp và lọc dữ liệu theo ngày, user, job
    report_type = params.get('report_type')
    if report_type == 'recruiter_stats':
        user = User.objects.get(id=params.get('user_id'))
        return get_recruiter_stats(user)
    # mở rộng các loại báo cáo khác
    return {}

# 13. Xuất báo cáo ra file (PDF, Excel)
def export_report_to_file(report_data, file_format='excel'):
    import io
    if file_format == 'excel':
        import pandas as pd
        df = pd.DataFrame(report_data)
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False)
        return output.getvalue()  # trả về bytes file
    elif file_format == 'pdf':
        # Có thể dùng reportlab hoặc thư viện tương tự để tạo pdf
        pass
    return None

# 14. Lấy các chỉ số KPI tùy chỉnh
def get_custom_metrics():
    # Ví dụ trả về số lượng tuyển dụng trung bình theo ngành, tỉ lệ duyệt hồ sơ,...
    avg_app_per_job = Application.objects.values('job_posting').annotate(count=Count('id')).aggregate(avg=Avg('count'))['avg']
    hired_ratio = Application.objects.filter(status=ApplicationStatus.HIRED).count() / Application.objects.count() if Application.objects.count() else 0
    return {
        'average_applications_per_job': avg_app_per_job,
        'overall_hired_ratio': hired_ratio,
    }
