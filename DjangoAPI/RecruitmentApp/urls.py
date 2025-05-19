from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from .views import RegisterView, LoginView, UserDetailUpdateView, CurrentUserView, RoleListView, JobSeekerRegisterView, \
    RecruiterRegisterView, AdminApproveRecruiterView, AdminAssignAdminRoleView, SwitchRoleView, JobPostingViewSet, \
    ConversationViewSet, MessageViewSet

router = DefaultRouter()
router.register(r'recruiter/job-postings', JobPostingViewSet, basename='job-posting')
router.register(r'conversations', ConversationViewSet)
conversations_router = routers.NestedSimpleRouter(router, r'conversations', lookup='conversation')
conversations_router.register(r'messages', MessageViewSet, basename='conversation-messages')


urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),

    path('auth/user/', UserDetailUpdateView.as_view(), name='user-detail-update'),
    path('auth/user-info/', CurrentUserView.as_view(), name='current-user-info'),
    path('roles/', RoleListView.as_view(), name='roles-list'),
    path('auth/register/job-seeker/', JobSeekerRegisterView.as_view(), name='register-job-seeker'),
    path('auth/register/recruiter/', RecruiterRegisterView.as_view(), name='register-recruiter'),
    path('admin/user-roles/approve/', AdminApproveRecruiterView.as_view(), name='admin-approve-recruiter'),
    path('admin/user-roles/assign-admin/', AdminAssignAdminRoleView.as_view(), name='admin-assign-admin'),
    path('auth/switch-role/', SwitchRoleView.as_view(), name='switch-role'),
    path('messages/<int:pk>/', MessageViewSet.as_view({'put': 'update'}), name='message-update'),

]
