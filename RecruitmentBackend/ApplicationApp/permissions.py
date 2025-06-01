from rest_framework.permissions import BasePermission

class IsJobSeeker(BasePermission):
    """
    Cho phép truy cập nếu user đã đăng nhập, có role JobSeeker và được phê duyệt.
    """
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and user.user_roles.filter(role__name='JobSeeker', is_approved=True).exists()

class IsRecruiter(BasePermission):
    """
    Cho phép truy cập nếu user đã đăng nhập, có role Recruiter và được phê duyệt.
    """
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and user.user_roles.filter(role__name='Recruiter', is_approved=True).exists()

class IsOwnerOrAdmin(BasePermission):
    """
    Quyền đối với object: chủ sở hữu hoặc admin.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.user_roles.filter(role__name='Admin', is_approved=True).exists():
            return True
        return obj.job_seeker == request.user
