import uuid
from django.db import models
from django.conf import settings
from cloudinary.models import CloudinaryField

class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Skill(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Kỹ năng"
        verbose_name_plural = "Các kỹ năng"
        ordering = ['name']

class JobSeekerProfile(BaseModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='job_seeker_profile')
    summary = models.TextField(blank=True, null=True)
    experience = models.TextField(blank=True, null=True)
    education = models.TextField(blank=True, null=True)
    skills = models.ManyToManyField(Skill, blank=True, related_name='job_seekers')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    GENDER_CHOICES = [('M', 'Nam'), ('F', 'Nữ'), ('O', 'Khác')]
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, null=True)

    def __str__(self):
        return f"Hồ sơ người tìm việc: {self.user.username}"

    class Meta:
        verbose_name = "Hồ sơ người tìm việc"
        verbose_name_plural = "Các hồ sơ người tìm việc"
        ordering = ['user__username']

class Resume(BaseModel):
    job_seeker = models.ForeignKey(JobSeekerProfile, on_delete=models.CASCADE, related_name='resumes')
    title = models.CharField(max_length=255, blank=True, null=True)
    file_path = CloudinaryField(folder='resumes', resource_type="raw")
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title or 'CV'} của {self.job_seeker.user.username}"

    class Meta:
        verbose_name = "CV"
        verbose_name_plural = "Các CV"
        ordering = ['-created_at']
