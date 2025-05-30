from django.urls import path
from .views import (
    RegisterView, LoginView, CurrentUserView,
    RoleListView, ActiveRoleUpdateView,
    RequestRecruiterRoleView, ApproveRecruiterView,
    AssignAdminRoleView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('user/', CurrentUserView.as_view(), name='auth-current-user'),
    path('roles/', RoleListView.as_view(), name='auth-role-list'),
    path('active-role/', ActiveRoleUpdateView.as_view(), name='auth-active-role'),
    path('request-recruiter/', RequestRecruiterRoleView.as_view(), name='auth-request-recruiter'),
    path('recruiter-approve/', ApproveRecruiterView.as_view(), name='auth-recruiter-approve'),
    path('assign-admin/', AssignAdminRoleView.as_view(), name='auth-assign-admin'),
]
