from django.urls import path

from .views import (
    BookingDetailView,
    BookingView,
    ChatView,
    DiagnosisView,
    MediaUploadView,
)

urlpatterns = [
    path('chat/', ChatView.as_view(), name='chat'),
    path('upload/', MediaUploadView.as_view(), name='upload'),
    path('diagnosis/', DiagnosisView.as_view(), name='diagnosis'),
    path('booking/', BookingView.as_view(), name='booking-list'),
    path('booking/<int:id>/', BookingDetailView.as_view(), name='booking-detail'),
]
