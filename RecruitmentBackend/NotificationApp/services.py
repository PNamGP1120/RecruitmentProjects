from django.contrib.auth import get_user_model

from .models import Notification

def create_notification_for_user_registration(user):
    Notification.objects.create(
        recipient=user,
        title='Chào mừng bạn đến với hệ thống',
        message='Bạn đã đăng ký tài khoản thành công.',
        notification_type='general',
    )

def create_notification_for_role_approved(user_role):
    Notification.objects.create(
        recipient=user_role.user,
        title='Vai trò được duyệt',
        message=f'Vai trò {user_role.role.name} của bạn đã được quản trị viên duyệt.',
        notification_type='general',
    )

User = get_user_model()

def create_notification_for_new_job(job_post):
    # Gửi cho tất cả người tìm việc đang active
    job_seekers = User.objects.filter(roles__name='JobSeeker', is_active=True).distinct()
    for user in job_seekers:
        Notification.objects.create(
            recipient=user,
            title='Có việc làm mới',
            message=f'Việc làm "{job_post.title}" đã được đăng tải.',
            notification_type='job',
            related_url=f'/jobs/{job_post.slug}'
        )

def create_notification_for_job_status_change(job_post, old_status, new_status):
    user = job_post.recruiter_profile.user
    if new_status == 'Pending':
        message = 'Yêu cầu duyệt tin tuyển dụng đã được gửi.'
    elif new_status == 'Approved':
        message = 'Tin tuyển dụng đã được duyệt.'
    elif new_status == 'Rejected':
        message = 'Tin tuyển dụng đã bị từ chối.'
    else:
        return

    Notification.objects.create(
        recipient=user,
        title='Cập nhật trạng thái tin tuyển dụng',
        message=message,
        notification_type='job',
        related_url=f'/jobs/{job_post.slug}'
    )

def create_notification_for_resume_created(resume):
    Notification.objects.create(
        recipient=resume.job_seeker.user,
        title='Bạn đã tạo CV mới',
        message=f'CV "{resume.title}" đã được tạo thành công.',
        notification_type='general',
        related_url=f'/resumes/{resume.id}',
    )

def create_notification_for_resume_activated(resume):
    Notification.objects.create(
        recipient=resume.job_seeker.user,
        title='CV đã được kích hoạt',
        message=f'CV "{resume.title}" đã được kích hoạt để sử dụng.',
        notification_type='general',
        related_url=f'/resumes/{resume.id}',
    )

def create_notification_for_application_status_change(application, old_status, new_status):
    user = application.job_seeker.user
    message_map = {
        'APPLIED': 'Bạn đã nộp hồ sơ thành công.',
        'WITHDRAWN': 'Bạn đã rút hồ sơ.',
        'OFFERED': 'Bạn đã nhận được lời mời làm việc.',
        'REJECTED': 'Hồ sơ của bạn đã bị từ chối.',
        'HIRED': 'Bạn đã được tuyển dụng.',
    }
    message = message_map.get(new_status, f"Trạng thái hồ sơ của bạn đã được cập nhật: {new_status}")

    Notification.objects.create(
        recipient=user,
        title='Cập nhật trạng thái ứng tuyển',
        message=message,
        notification_type='application',
        related_url=f'/applications/{application.id}',
    )

def create_notification_for_interview_status_change(interview, old_status, new_status):
    user = interview.application.job_seeker.user
    message_map = {
        'SCHEDULED': 'Bạn có lịch phỏng vấn mới.',
        'CANCELED': 'Lịch phỏng vấn đã bị huỷ.',
        'COMPLETED': 'Phỏng vấn đã hoàn thành.',
    }
    message = message_map.get(new_status, f"Trạng thái phỏng vấn đã được cập nhật: {new_status}")

    Notification.objects.create(
        recipient=user,
        title='Cập nhật lịch phỏng vấn',
        message=message,
        notification_type='interview',
        related_url=f'/interviews/{interview.id}',
    )