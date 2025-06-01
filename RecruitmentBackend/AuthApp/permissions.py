from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.user_roles.filter(role__name='Admin', is_approved=True).exists()

class IsRecruiterApproved(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.user_roles.filter(role__name='Recruiter', is_approved=True).exists()
