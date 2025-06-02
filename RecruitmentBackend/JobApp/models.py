import uuid
from django.db import models
from django.utils.text import slugify
from django.utils import timezone
from cloudinary.models import CloudinaryField
from django.conf import settings

class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class RecruiterProfile(BaseModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recruiter_profile'
    )
    company_name = models.CharField(max_length=255)
    company_website = models.URLField(blank=True, null=True)
    company_description = models.TextField(blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    company_logo = CloudinaryField(blank=True, null=True, folder='company_logos')

    def __str__(self):
        return f"{self.company_name} ({self.user.username})"

    class Meta:
        verbose_name = "Hồ sơ nhà tuyển dụng"
        verbose_name_plural = "Các hồ sơ nhà tuyển dụng"
        ordering = ['company_name']


class JobType(models.TextChoices):
    FULL_TIME = 'Full-time', 'Toàn thời gian'
    PART_TIME = 'Part-time', 'Bán thời gian'
    FREELANCE = 'Freelance', 'Tự do'
    INTERN = 'Intern', 'Thực tập'


class JobStatus(models.TextChoices):
    DRAFT = 'Draft', 'Bản nháp'
    PENDING = 'Pending', 'Chờ duyệt'
    APPROVED = 'Approved', 'Đã duyệt'
    REJECTED = 'Rejected', 'Bị từ chối'
    EXPIRED = 'Expired', 'Hết hạn'


class JobPosting(BaseModel):
    recruiter_profile = models.ForeignKey(
        RecruiterProfile,
        on_delete=models.CASCADE,
        related_name='job_postings',
        null=True,
        blank=True
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255)
    salary_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    job_type = models.CharField(max_length=20, choices=JobType.choices, default=JobType.FULL_TIME)
    status = models.CharField(max_length=20, choices=JobStatus.choices, default=JobStatus.DRAFT)
    is_active = models.BooleanField(default=True)
    expiration_date = models.DateField(null=True, blank=True)
    views_count = models.PositiveIntegerField(default=0)
    slug = models.SlugField(max_length=255, unique=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Tin tuyển dụng"
        verbose_name_plural = "Các tin tuyển dụng"

    def __str__(self):
        return f"{self.title} tại {self.recruiter_profile.company_name}"

    def save(self, *args, **kwargs):
        # Tạo hoặc cập nhật slug khi tạo/sửa
        if not self.slug or self._title_changed():
            base_slug = slugify(self.title)
            slug = base_slug
            num = 1
            while JobPosting.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{num}"
                num += 1
            self.slug = slug

        # Tự động cập nhật trạng thái khi hết hạn
        if self.expiration_date and self.expiration_date < timezone.now().date():
            self.is_active = False
            self.status = JobStatus.EXPIRED

        super().save(*args, **kwargs)

    def _title_changed(self):
        if not self.pk:
            return True
        old_title = JobPosting.objects.filter(pk=self.pk).values_list('title', flat=True).first()
        return old_title != self.title
