from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RecruiterProfileView, JobPostingViewSet

router = DefaultRouter()
router.register(r'jobs', JobPostingViewSet, basename='jobposting')

urlpatterns = [
    # API thao tác hồ sơ nhà tuyển dụng user hiện tại
    path('recruiter/profile/', RecruiterProfileView.as_view(), name='recruiter-profile'),

    # API CRUD tin tuyển dụng sử dụng router
    path('', include(router.urls)),
]
