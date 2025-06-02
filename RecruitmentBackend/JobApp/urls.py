from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RecruiterProfileViewSet,
    JobPostingViewSet,
    AdminJobApprovalViewSet,
    RecruiterJobsViewSet,
    JobTypeListAPIView,
    JobStatusListAPIView,
    JobRecommendAPIView,
)

router = DefaultRouter()
router.register(r'recruiters', RecruiterProfileViewSet, basename='recruiter')
router.register(r'jobs', JobPostingViewSet, basename='jobposting')

urlpatterns = [
    path('', include(router.urls)),

    # Admin quản lý duyệt tin tuyển dụng
    path('api/admin/jobs/pending/', AdminJobApprovalViewSet.as_view({'get': 'list'}), name='admin-jobs-pending'),
    path('api/admin/jobs/<slug:slug>/approve/', AdminJobApprovalViewSet.as_view({'post': 'approve'}), name='admin-job-approve'),
    path('api/admin/jobs/<slug:slug>/reject/', AdminJobApprovalViewSet.as_view({'post': 'reject'}), name='admin-job-reject'),

    # Lấy danh sách tin tuyển dụng theo recruiter
    path('recruiters/<uuid:recruiter_id>/jobs/', RecruiterJobsViewSet.as_view({'get': 'list'}), name='recruiter-jobs'),

    # Danh sách loại công việc
    path('types/', JobTypeListAPIView.as_view(), name='job-types'),

    # Danh sách trạng thái công việc
    path('statuses/', JobStatusListAPIView.as_view(), name='job-statuses'),

    # API gợi ý việc làm
    path('recommend/', JobRecommendAPIView.as_view(), name='job-recommend'),
]
