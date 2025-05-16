from rest_framework import permissions


class AllowAnyUser(permissions.BasePermission):
    """
    Cho phép mọi người truy cập, không yêu cầu đăng nhập.
    Dùng cho API như đăng ký tài khoản, lấy danh sách công khai,...
    """
    def has_permission(self, request, view):
        return True


class IsAuthenticated(permissions.BasePermission):
    """
    Yêu cầu người dùng phải đăng nhập.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class IsSuperAdmin(permissions.BasePermission):
    """
    Cho phép truy cập nếu user là superuser (admin hệ thống cấp cao).
    """
    def has_permission(self, request, view):
        user = request.user
        return user and user.is_authenticated and user.is_superuser


class IsStaffAdmin(permissions.BasePermission):
    """
    Cho phép truy cập nếu user là staff (được phép truy cập admin),
    bao gồm cả superuser và admin thường.
    """
    def has_permission(self, request, view):
        user = request.user
        return user and user.is_authenticated and user.is_staff


class IsAdmin(permissions.BasePermission):
    """
    Cho phép truy cập nếu user có vai trò Admin (theo active_role trong model).
    """
    def has_permission(self, request, view):
        user = request.user
        return (
            user and
            user.is_authenticated and
            user.active_role and
            user.active_role.role_name == 'Admin'
        )


class IsRecruiter(permissions.BasePermission):
    """
    Cho phép truy cập nếu user là Nhà tuyển dụng đã được phê duyệt.
    """
    def has_permission(self, request, view):
        user = request.user
        return (
            user and
            user.is_authenticated and
            user.active_role and
            user.active_role.role_name == 'Recruiter'
        )


class IsJobSeeker(permissions.BasePermission):
    """
    Cho phép truy cập nếu user là Người tìm việc đã được phê duyệt.
    """
    def has_permission(self, request, view):
        user = request.user
        return (
            user and
            user.is_authenticated and
            user.active_role and
            user.active_role.role_name == 'JobSeeker'
        )


class IsAuthenticatedAndApproved(permissions.BasePermission):
    """
    Kiểm tra user đã đăng nhập và ít nhất có một vai trò được phê duyệt.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.user_roles.filter(is_approved=True).exists()


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Cho phép truy cập nếu là chủ sở hữu tài nguyên hoặc admin (bất kỳ admin nào).
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_staff:
            return True
        if hasattr(obj, 'my_user'):
            return obj.my_user == user
        if hasattr(obj, 'sender'):
            return obj.sender == user
        if hasattr(obj, 'recipient'):
            return obj.recipient == user
        return False


class DenyAll(permissions.BasePermission):
    """
    Từ chối tất cả truy cập, dùng khi cần khóa API.
    """
    def has_permission(self, request, view):
        return False
