from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAuthenticatedAndApproved(BasePermission):
    """
    User phải đăng nhập và có ít nhất 1 vai trò được phê duyệt.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # Kiểm tra có ít nhất 1 role được phê duyệt
        return user.user_roles.filter(is_approved=True).exists()

class HasActiveRole(BasePermission):
    """
    Kiểm tra user có active_role và active_role.name trùng với role yêu cầu.
    """
    required_role = None  # Gán trong subclass

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if not user.active_role:
            return False
        if user.active_role.name != self.required_role:
            return False
        # Kiểm tra role được phê duyệt
        return user.user_roles.filter(role__name=self.required_role, is_approved=True).exists()

class IsAdmin(HasActiveRole):
    required_role = 'Admin'

class IsRecruiter(HasActiveRole):
    required_role = 'Recruiter'

class IsJobSeeker(HasActiveRole):
    required_role = 'JobSeeker'

class IsOwnerOrAdmin(BasePermission):
    """
    Cho phép thao tác nếu là chủ sở hữu (obj.user) hoặc admin.
    user_field: tên trường tham chiếu user trên object.
    """
    user_field = 'user'

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # Admin đã phê duyệt
        if user.active_role and user.active_role.name == 'Admin' and user.user_roles.filter(role__name='Admin', is_approved=True).exists():
            return True
        obj_user = getattr(obj, self.user_field, None)
        return obj_user == user

class IsRecruiterOwnerOrAdmin(BasePermission):
    """
    Cho phép thao tác nếu là chủ sở hữu (obj.recruiter_profile.user) hoặc admin.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        # Admin đã phê duyệt
        if user.active_role and user.active_role.name == 'Admin' and user.user_roles.filter(role__name='Admin', is_approved=True).exists():
            return True
        return obj.recruiter_profile.user == user
