from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    RegisterView, UserUpdateView, JobSeekerRegisterView, RecruiterRegisterView,
    AdminApproveRecruiterView, AdminAssignAdminRoleView, LoginView, CurrentUserView,
    RoleListView, SwitchRoleView, JobSeekerProfileView, RecruiterProfileView, UpdateRecruiterProfileView,
    CVListCreateView, CVUpdateView, CVSoftDeleteView, CVSetDefaultView, MessageViewSet, JobPostingViewSet,
    ConversationViewSet
)

router = DefaultRouter()
router.register(r'recruiter/job-postings', JobPostingViewSet, basename='job-posting')
router.register(r'conversations', ConversationViewSet)
router.register(r'conversations/(?P<conversation_id>\d+)/messages', MessageViewSet)
# router.register(r'messages', MessageViewSet, basename="messages")

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),

    path('auth/user/', UserUpdateView.as_view(), name='user-update'),
    path('auth/user-info/', CurrentUserView.as_view(), name='current-user'),
    path('roles/', RoleListView.as_view(), name='roles-list'),

    path('auth/register/job-seeker/', JobSeekerRegisterView.as_view(), name='register-job-seeker'),
    path('auth/register/recruiter/', RecruiterRegisterView.as_view(), name='register-recruiter'),
    path('admin/user-roles/approve/', AdminApproveRecruiterView.as_view(), name='admin-approve-recruiter'),
    path('admin/user-roles/assign-admin/', AdminAssignAdminRoleView.as_view(), name='admin-assign-admin'),

    path('auth/switch-role/', SwitchRoleView.as_view(), name='switch-role'),
    path('messages/<int:pk>/', MessageViewSet.as_view({'put': 'update'}), name='message-update'),

    path('jobseeker/profile/', JobSeekerProfileView.as_view(), name='job-seeker-profile'),
    path('recruiter/profile/', RecruiterProfileView.as_view(), name='recruiter-profile'),
    path('recruiter/profile/update/', UpdateRecruiterProfileView.as_view(), name='recruiter-profile-update'),
    path('jobseeker/cvs/', CVListCreateView.as_view(), name='cv-list-create'),
    path('jobseeker/cvs/<int:pk>/update/', CVUpdateView.as_view(), name='cv-update'),
    path('jobseeker/cvs/delete/', CVSoftDeleteView.as_view(), name='cv-delete'),
    path('jobseeker/cvs/<int:cv_id>/set-default/', CVSetDefaultView.as_view(), name='cv-set-default'),
]
