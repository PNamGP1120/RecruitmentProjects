# from .views import (
#     RegisterView,
#     UserDetailUpdateView,  # GET/PATCH user info
#     JobSeekerRegisterView,
#     RecruiterRegisterView,
#     AdminApproveRecruiterView,
#     AdminAssignAdminRoleView,
#     LoginView,
#     CurrentUserView,
#     RoleListView,
#     SwitchRoleView,
#     PasswordResetRequestView,  # Mới thêm: gửi email lấy lại mật khẩu
#     PasswordResetConfirmView  # Mới thêm: xác nhận đặt lại mật khẩu
# )
#
# app_name = 'accounts'  # Namespace URL
#
# urlpatterns = [
#     # Đăng ký & đăng nhập
#     path('auth/register/', RegisterView.as_view(), name='register'),
#     path('auth/register/job-seeker/', JobSeekerRegisterView.as_view(), name='register-job-seeker'),
#     path('auth/register/recruiter/', RecruiterRegisterView.as_view(), name='register-recruiter'),
#     path('auth/login/', LoginView.as_view(), name='login'),
#     path('auth/switch-role/', SwitchRoleView.as_view(), name='switch-role'),
#
#     # Thông tin người dùng (lấy và cập nhật)
#     path('auth/user/', UserDetailUpdateView.as_view(), name='user-detail-update'),
#     path('auth/user-info/', CurrentUserView.as_view(), name='current-user-info'),
#
#     # Danh sách vai trò
#     path('roles/', RoleListView.as_view(), name='roles-list'),
#     path('auth/user-roles/', UserRolesView.as_view(), name='user-roles'),
#     path('auth/available-roles/', AvailableRolesForUserView.as_view(), name='available-roles'),
#
#     # Admin: phê duyệt và cấp quyền
#     path('admin/user-roles/approve/', AdminApproveRecruiterView.as_view(), name='admin-approve-recruiter'),
#     path('admin/user-roles/assign-admin/', AdminAssignAdminRoleView.as_view(), name='admin-assign-admin'),
#
#     # Lấy lại mật khẩu
#     path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
#     path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
# ]
#
#
