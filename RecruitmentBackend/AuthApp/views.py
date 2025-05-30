from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Role, UserRole
from .permissions import IsAuthenticatedAndApproved, IsAdmin
from .serializers import (
    RegisterSerializer, UserSerializer, RoleSerializer,
    ActiveRoleSerializer, RequestRecruiterRoleSerializer
)
from rest_framework.permissions import IsAuthenticated, IsAdminUser

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = []

class LoginView(TokenObtainPairView):
    permission_classes = []

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticatedAndApproved]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class RoleListView(generics.ListAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticatedAndApproved]

class ActiveRoleUpdateView(APIView):
    permission_classes = [IsAuthenticatedAndApproved]

    def post(self, request):
        serializer = ActiveRoleSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data)

class RequestRecruiterRoleView(APIView):
    permission_classes = [IsAuthenticatedAndApproved]

    def post(self, request):
        serializer = RequestRecruiterRoleSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        data = serializer.save()
        return Response(data, status=status.HTTP_201_CREATED)

class ApproveRecruiterView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        user_id = request.data.get('user_id')
        try:
            user_role = UserRole.objects.get(user_id=user_id, role__name=Role.RECRUITER)
            if user_role.is_approved:
                return Response({"detail": "Đã được duyệt trước đó."}, status=status.HTTP_400_BAD_REQUEST)

            user_role.is_approved = True
            user_role.approved_by = request.user
            user_role.approved_at = timezone.now()
            user_role.save()
            return Response({"detail": "Recruiter đã được phê duyệt."})
        except UserRole.DoesNotExist:
            return Response({"error": "Không tìm thấy nhà tuyển dụng cần phê duyệt."}, status=status.HTTP_404_NOT_FOUND)

class AssignAdminRoleView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            admin_role = Role.objects.get(name=Role.ADMIN)
            user_role, created = UserRole.objects.get_or_create(user=user, role=admin_role)
            user_role.is_approved = True
            user_role.approved_by = request.user
            user_role.approved_at = timezone.now()
            user_role.save()
            return Response({"detail": f"User {email} đã được gán quyền Admin."})
        except User.DoesNotExist:
            return Response({"error": "Không tìm thấy user với email này."}, status=status.HTTP_404_NOT_FOUND)
