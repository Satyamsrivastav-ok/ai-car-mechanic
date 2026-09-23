/**
 * Data structures for AI Car Mechanic application.
 * Designed to cleanly map to Django REST Framework serializers and models.
 */

export type MediaType = 'image' | 'audio' | 'video';

export interface MediaAttachment {
  id: string;
  type: MediaType;
  url: string; // base64 or object URL or remote URL
  fileName: string;
  fileSize: number; // in bytes
  mimeType: string;
  duration?: number; // for audio/video in seconds
  thumbnailUrl?: string;
  description?: string;
  file?: File;
}

export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface PossibleCause {
  cause: string;
  probability: 'High' | 'Medium' | 'Low';
  percentage: number; // e.g. 75
  description: string;
  symptomsMatch: string[];
}

export interface DiagnosticReport {
  id: string;
  problemSummary: string;
  possibleCauses: PossibleCause[];
  mostLikelyIssue: string;
  recommendedRepair: string;
  urgency: UrgencyLevel;
  urgencyReason: string;
  canDriveSafely: boolean;
  drivingAdvice: string;
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
    partsEstimate: number;
    laborEstimate: number;
  };
  confidenceScore: number; // 0 - 100
  requiresPhysicalInspection: boolean;
  disclaimer: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: MediaAttachment[];
  diagnosis?: DiagnosticReport;
  followUpQuestions?: string[];
  suggestedReplies?: string[];
  isOffTopic?: boolean;
  status?: 'sending' | 'sent' | 'error';
  errorMessage?: string;
}

export interface VehicleProfile {
  year: string;
  make: string;
  model: string;
  mileage: string;
  engine?: string;
  vin?: string;
}

export interface MechanicBooking {
  id: string;
  bookingReference: string; // e.g. ACM-2026-89412
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceType: 'mobile_mechanic' | 'service_center' | 'towing_and_repair';
  preferredDate: string;
  preferredTime: string;
  serviceLocation: string;
  vehicle: VehicleProfile;
  attachedDiagnosis?: DiagnosticReport;
  notes?: string;
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
  assignedTechnician?: {
    name: string;
    certifications: string[];
    rating: number;
    experienceYears: number;
  };
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  vehicle: VehicleProfile;
  messages: ChatMessage[];
  latestDiagnosis?: DiagnosticReport;
  booking?: MechanicBooking;
  isDiagnosed: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
