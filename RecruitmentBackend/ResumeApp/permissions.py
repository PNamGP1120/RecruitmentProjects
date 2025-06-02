from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAuthenticated(BasePermission):
    """
    Chỉ cho phép người dùng đã đăng nhập.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

class IsAdminUser(BasePermission):
    """
    Chỉ cho phép user có vai trò Admin.
    """
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.active_role
            and request.user.active_role.name == 'Admin'
        )

class IsJobSeeker(BasePermission):
    """
    Chỉ cho phép user có vai trò JobSeeker.
    """
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.active_role
            and request.user.active_role.name == 'JobSeeker'
        )

class IsOwnerOrAdmin(BasePermission):
    """
    Cho phép chỉnh sửa/xóa nếu là chủ sở hữu tài nguyên hoặc admin.
    Cho phép đọc công khai (GET, HEAD, OPTIONS).
    """

    message = "Bạn không có quyền thực hiện hành động này."

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        # admin được quyền thao tác tất cả
        if request.user and request.user.is_authenticated and request.user.active_role:
            if request.user.active_role.name == 'Admin':
                return True

        # Kiểm tra chủ sở hữu tài nguyên
        # Với model Resume, JobSeekerProfile, Skill - định nghĩa cách lấy user sở hữu
        owner = None
        # Resume
        if hasattr(obj, 'job_seeker'):
            owner = obj.job_seeker.user
        # JobSeekerProfile
        elif hasattr(obj, 'user'):
            owner = obj.user
        # Skill không có chủ sở hữu, chỉ admin có quyền sửa/xóa
        elif hasattr(obj, 'id'):  # chỉ admin được phép
            return False

        return owner == request.user

class IsJobSeekerAndOwner(BasePermission):
    """
    Chỉ cho phép user là JobSeeker và là chủ sở hữu tài nguyên.
    """

    message = "Bạn phải là chủ sở hữu hồ sơ và có vai trò Người tìm việc."
    print(message)
    def has_object_permission(self, request, view, obj):
        if not (request.user and request.user.is_authenticated):
            return False
        if not request.user.active_role or request.user.active_role.name != 'JobSeeker':
            return False

        # Kiểm tra chủ sở hữu
        owner = None
        if hasattr(obj, 'job_seeker'):
            owner = obj.job_seeker.user
        elif hasattr(obj, 'user'):
            owner = obj.user
        else:
            return False

        if request.method in SAFE_METHODS:
            # Cho phép đọc nếu là chủ sở hữu
            return owner == request.user

        return owner == request.user
