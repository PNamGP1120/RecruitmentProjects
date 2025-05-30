from rest_framework.permissions import BasePermission

class IsJobSeeker(BasePermission):
    """
    Cho phép truy cập nếu user có vai trò JobSeeker đã được phê duyệt.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.user_roles.filter(role__name='JobSeeker', is_approved=True).exists()

class IsRecruiter(BasePermission):
    """
    Cho phép truy cập nếu user có vai trò Recruiter đã được phê duyệt.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.user_roles.filter(role__name='Recruiter', is_approved=True).exists()

class IsAdmin(BasePermission):
    """
    Cho phép truy cập nếu user có vai trò Admin đã được phê duyệt.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.user_roles.filter(role__name='Admin', is_approved=True).exists()

class IsAuthenticatedAndApproved(BasePermission):
    """
    Cho phép truy cập nếu user đã đăng nhập và có ít nhất một vai trò được phê duyệt.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.user_roles.filter(is_approved=True).exists()

class IsOwnerOrAdmin(BasePermission):
    """
    Cho phép truy cập nếu user là chủ sở hữu resource hoặc có vai trò Admin.
    Thường dùng trong permission object-level.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.user_roles.filter(role__name='Admin', is_approved=True).exists():
            return True
        return obj.user == user  # Giả sử obj có trường user
