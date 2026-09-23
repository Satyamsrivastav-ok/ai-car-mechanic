from django.db import models


class Conversation(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-created_at"]

    def __str__(self):
        return f"Conversation {self.pk}"


class Message(models.Model):
    ROLE_USER = "user"
    ROLE_ASSISTANT = "assistant"
    ROLE_CHOICES = [
        (ROLE_USER, "User"),
        (ROLE_ASSISTANT, "Assistant"),
    ]

    conversation = models.ForeignKey(
        Conversation,
        related_name="messages",
        on_delete=models.CASCADE,
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_USER)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.role.title()} message in conversation {self.conversation_id}"


class Media(models.Model):
    MEDIA_IMAGE = "image"
    MEDIA_AUDIO = "audio"
    MEDIA_VIDEO = "video"
    MEDIA_TYPE_CHOICES = [
        (MEDIA_IMAGE, "Image"),
        (MEDIA_AUDIO, "Audio"),
        (MEDIA_VIDEO, "Video"),
    ]

    conversation = models.ForeignKey(
        Conversation,
        related_name="media_files",
        on_delete=models.CASCADE,
    )
    message = models.ForeignKey(
        Message,
        related_name="media_files",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    file = models.FileField(upload_to="chatbot_media/")
    media_type = models.CharField(
        max_length=20,
        choices=MEDIA_TYPE_CHOICES,
        default=MEDIA_IMAGE,
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.media_type.title()} media for conversation {self.conversation_id}"


class Diagnosis(models.Model):
    URGENCY_LOW = "low"
    URGENCY_MEDIUM = "medium"
    URGENCY_HIGH = "high"
    URGENCY_CHOICES = [
        (URGENCY_LOW, "Low"),
        (URGENCY_MEDIUM, "Medium"),
        (URGENCY_HIGH, "High"),
    ]

    conversation = models.OneToOneField(
        Conversation,
        related_name="diagnosis",
        on_delete=models.CASCADE,
    )
    problem_summary = models.TextField()
    possible_causes = models.TextField(blank=True, default="")
    most_likely_issue = models.CharField(max_length=255, blank=True, default="")
    recommended_service = models.TextField(blank=True, default="")
    urgency = models.CharField(
        max_length=20,
        choices=URGENCY_CHOICES,
        default=URGENCY_MEDIUM,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Diagnosis for conversation {self.conversation_id}"


class Booking(models.Model):
    STATUS_PENDING = "pending"
    STATUS_CONFIRMED = "confirmed"
    STATUS_COMPLETED = "completed"
    STATUS_CANCELLED = "cancelled"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_CONFIRMED, "Confirmed"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    conversation = models.ForeignKey(
        Conversation,
        related_name="bookings",
        on_delete=models.CASCADE,
    )
    customer_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    vehicle_model = models.CharField(max_length=255)
    preferred_date = models.DateField()
    preferred_time = models.TimeField()
    issue_description = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking for {self.customer_name} ({self.status})"


__all__ = [
    "Conversation",
    "Message",
    "Media",
    "Diagnosis",
    "Booking",
]
