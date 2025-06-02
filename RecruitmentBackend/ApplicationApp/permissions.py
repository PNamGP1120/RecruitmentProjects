from rest_framework.permissions import BasePermission

# Yêu cầu người dùng đã đăng nhập và có vai trò đang hoạt động
class IsAuthenticatedAndApproved(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return (
            user.is_authenticated and
            user.active_role and
            user.user_roles.filter(role=user.active_role, is_approved=True).exists()
        )


class IsJobSeeker(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return (
            user.is_authenticated and
            user.active_role and
            user.active_role.name == 'JobSeeker' and
            user.user_roles.filter(role=user.active_role, is_approved=True).exists()
        )


class IsRecruiter(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return (
            user.is_authenticated and
            user.active_role and
            user.active_role.name == 'Recruiter' and
            user.user_roles.filter(role=user.active_role, is_approved=True).exists()
        )


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return (
            user.is_authenticated and
            user.active_role and
            user.active_role.name == 'Admin' and
            user.user_roles.filter(role=user.active_role, is_approved=True).exists()
        )
