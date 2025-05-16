from django.urls import path
from .views import (
    RegisterView, UserUpdateView, JobSeekerRegisterView, RecruiterRegisterView,
    AdminApproveRecruiterView, AdminAssignAdminRoleView, LoginView, CurrentUserView,
    RoleListView, SwitchRoleView
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/user/', UserUpdateView.as_view(), name='user-update'),
    path('auth/register/job-seeker/', JobSeekerRegisterView.as_view(), name='register-job-seeker'),
    path('auth/register/recruiter/', RecruiterRegisterView.as_view(), name='register-recruiter'),
    path('admin/user-roles/approve/', AdminApproveRecruiterView.as_view(), name='admin-approve-recruiter'),
    path('admin/user-roles/assign-admin/', AdminAssignAdminRoleView.as_view(), name='admin-assign-admin'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/user-info/', CurrentUserView.as_view(), name='current-user'),
    path('roles/', RoleListView.as_view(), name='roles-list'),
    path('auth/switch-role/', SwitchRoleView.as_view(), name='switch-role'),
]
