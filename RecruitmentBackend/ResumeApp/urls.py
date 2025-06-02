from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SkillViewSet, JobSeekerProfileViewSet, ResumeViewSet

router = DefaultRouter()
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'job-seeker-profiles', JobSeekerProfileViewSet, basename='jobseekerprofile')
router.register(r'resumes', ResumeViewSet, basename='resume')

urlpatterns = [
    path('', include(router.urls)),
]
