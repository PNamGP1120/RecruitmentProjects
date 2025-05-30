from rest_framework.permissions import BasePermission

class IsRecruiter(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and user.user_roles.filter(role__name='Recruiter', is_approved=True).exists()

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and user.user_roles.filter(role__name='Admin', is_approved=True).exists()

class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.user_roles.filter(role__name='Admin', is_approved=True).exists():
            return True
        # So sánh với user trong recruiter_profile của job
        return obj.recruiter_profile.user == user
