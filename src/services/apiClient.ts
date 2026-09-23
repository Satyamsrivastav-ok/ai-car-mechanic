/**
 * AI Car Mechanic - API Service Layer
 *
 * Designed as a clean decoupled service layer ready to connect to a Django REST Framework
 * backend (e.g. Django Ninja / DRF endpoints like /api/v1/chat/, /api/v1/bookings/).
 *
 * Includes:
 * - Typed request/response interfaces
 * - Simulated network latency configurable for realistic UX testing
 * - Configurable error simulation (Network error, HTTP 500) for testing UI error resilience
 * - LocalStorage persistence for sessions and bookings
 * - Integration with MechanicAiService
 */

import {
  ChatSession,
  ChatMessage,
  MediaAttachment,
  MechanicBooking,
  VehicleProfile,
  DiagnosticReport,
  ApiError,
} from '../types/mechanic';
import { MechanicAiService } from './mechanicAiService';

const STORAGE_KEY_SESSIONS = 'ai_mechanic_sessions_v1';
const STORAGE_KEY_BOOKINGS = 'ai_mechanic_bookings_v1';

// Default initial vehicle
export const DEFAULT_VEHICLE: VehicleProfile = {
  year: '2019',
  make: 'Honda',
  model: 'Civic EX',
  mileage: '48,500',
  engine: '2.0L 4-Cylinder i-VTEC',
};

// Simulation settings state
export interface ApiConfig {
  simulatedLatencyMs: number;
  simulatedErrorMode: 'none' | 'network_timeout' | 'server_500';
  apiUrl: string;
}

let apiConfig: ApiConfig = {
  simulatedLatencyMs: 650,
  simulatedErrorMode: 'none',
  apiUrl: '/api/v1', // Target Django REST base URL
};

export const getApiConfig = (): ApiConfig => ({ ...apiConfig });
export const setApiConfig = (newConfig: Partial<ApiConfig>): void => {
  apiConfig = { ...apiConfig, ...newConfig };
};

// Helper delay simulating network roundtrip
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class MechanicApiClient {
  /**
   * Internal error simulation guard
   */
  private checkSimulatedErrors(): void {
    if (apiConfig.simulatedErrorMode === 'network_timeout') {
      const err: ApiError = {
        message: 'Network request timed out: unable to reach the automotive diagnostic service.',
        status: 408,
        code: 'TIMEOUT_ERROR',
      };
      throw err;
    }
    if (apiConfig.simulatedErrorMode === 'server_500') {
      const err: ApiError = {
        message: 'Internal Diagnostic Engine Error (HTTP 500): The server encountered an unexpected condition while processing telemetry.',
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
      };
      throw err;
    }
  }

  // --- LOCALSTORAGE PERSISTENCE HELPERS ---
  private loadStoredSessions(): ChatSession[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse sessions from localStorage', e);
    }
    return [];
  }

  private saveStoredSessions(sessions: ChatSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to persist sessions to localStorage', e);
    }
  }

  private loadStoredBookings(): MechanicBooking[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BOOKINGS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse bookings from localStorage', e);
    }
    return [];
  }

  private saveStoredBookings(bookings: MechanicBooking[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
    } catch (e) {
      console.warn('Failed to persist bookings to localStorage', e);
    }
  }

  /**
   * Django Endpoint: GET /api/v1/sessions/
   * Fetches all user diagnostic sessions.
   */
  public async getSessions(): Promise<ChatSession[]> {
    await delay(apiConfig.simulatedLatencyMs / 2);
    this.checkSimulatedErrors();

    let sessions = this.loadStoredSessions();
    if (sessions.length === 0) {
      // Create initial seed session
      const initialSession = this.createDefaultSession(DEFAULT_VEHICLE);
      sessions = [initialSession];
      this.saveStoredSessions(sessions);
    }
    return sessions;
  }

  /**
   * Django Endpoint: GET /api/v1/sessions/{id}/
   * Fetches a specific session by ID.
   */
  public async getSession(sessionId: string): Promise<ChatSession | null> {
    await delay(apiConfig.simulatedLatencyMs / 2);
    this.checkSimulatedErrors();

    const sessions = this.loadStoredSessions();
    return sessions.find((s) => s.id === sessionId) || null;
  }

  /**
   * Django Endpoint: POST /api/v1/sessions/
   * Initializes a new diagnostic consultation session.
   */
  public async createSession(vehicle: VehicleProfile = DEFAULT_VEHICLE, title = 'New Diagnostic'): Promise<ChatSession> {
    await delay(apiConfig.simulatedLatencyMs / 2);
    this.checkSimulatedErrors();

    const newSession = this.createDefaultSession(vehicle, title);
    const sessions = this.loadStoredSessions();
    sessions.unshift(newSession);
    this.saveStoredSessions(sessions);
    return newSession;
  }

  /**
   * Django Endpoint: DELETE /api/v1/sessions/{id}/
   */
  public async deleteSession(sessionId: string): Promise<void> {
    await delay(apiConfig.simulatedLatencyMs / 3);
    const sessions = this.loadStoredSessions().filter((s) => s.id !== sessionId);
    this.saveStoredSessions(sessions);
  }

  /**
   * Django Endpoint: PATCH /api/v1/sessions/{id}/vehicle/
   * Updates vehicle profile for current diagnostic session.
   */
  public async updateVehicle(sessionId: string, vehicle: VehicleProfile): Promise<ChatSession> {
    await delay(apiConfig.simulatedLatencyMs / 3);
    const sessions = this.loadStoredSessions();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) throw new Error('Session not found');

    session.vehicle = vehicle;
    session.updatedAt = new Date().toISOString();
    this.saveStoredSessions(sessions);
    return session;
  }

  /**
   * Django Endpoint: POST /api/v1/sessions/{id}/messages/
   * Dispatches user message and attachments to the virtual mechanic,
   * returning both the recorded user message and technician response.
   */
  public async sendMessage(
    sessionId: string,
    content: string,
    attachments: MediaAttachment[] = []
  ): Promise<{
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
    diagnosis?: DiagnosticReport;
  }> {
    await delay(apiConfig.simulatedLatencyMs);
    this.checkSimulatedErrors();

    const sessions = this.loadStoredSessions();
    const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
    if (sessionIndex === -1) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const session = sessions[sessionIndex];

    // Create User Message
    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      content,
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? attachments : undefined,
      status: 'sent',
    };

    session.messages.push(userMessage);

    // Call Technician AI Service
    const aiResponse = await MechanicAiService.processMessage(
      content,
      session.messages,
      attachments,
      session.vehicle
    );

    // Create Assistant Message
    const assistantMessage: ChatMessage = {
      id: `msg-ast-${Date.now() + 1}`,
      sender: 'assistant',
      content: aiResponse.content,
      timestamp: new Date().toISOString(),
      followUpQuestions: aiResponse.followUpQuestions,
      suggestedReplies: aiResponse.suggestedReplies,
      diagnosis: aiResponse.diagnosis,
      isOffTopic: aiResponse.isOffTopic,
      status: 'sent',
    };

    session.messages.push(assistantMessage);
    session.updatedAt = new Date().toISOString();

    // Auto-update session title based on the first real complaint if still default
    if (session.messages.filter((m) => m.sender === 'user').length === 1 && !aiResponse.isOffTopic) {
      const shortSnippet = content.slice(0, 36).trim();
      session.title = shortSnippet ? `${shortSnippet}...` : 'Car Diagnostic';
    }

    if (aiResponse.diagnosis) {
      session.latestDiagnosis = aiResponse.diagnosis;
      session.isDiagnosed = true;
    }

    sessions[sessionIndex] = session;
    this.saveStoredSessions(sessions);

    return {
      userMessage,
      assistantMessage,
      diagnosis: aiResponse.diagnosis,
    };
  }

  /**
   * Django Endpoint: POST /api/v1/upload/
   * Simulates multipart file upload to media storage bucket.
   */
  public async uploadMedia(file: File): Promise<MediaAttachment> {
    await delay(apiConfig.simulatedLatencyMs / 1.5);
    this.checkSimulatedErrors();

    let type: 'image' | 'audio' | 'video' = 'image';
    if (file.type.startsWith('audio/')) type = 'audio';
    else if (file.type.startsWith('video/')) type = 'video';

    // Read as Base64 Data URL for client playback
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read media file'));
      reader.readAsDataURL(file);
    });

    const attachment: MediaAttachment = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      url: dataUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      description: `Uploaded ${type} file`,
    };

    return attachment;
  }

  /**
   * Django Endpoint: POST /api/v1/bookings/
   * Books a service appointment with diagnostic payload attached.
   */
  public async createBooking(
    bookingData: Omit<MechanicBooking, 'id' | 'bookingReference' | 'createdAt' | 'status'>
  ): Promise<MechanicBooking> {
    await delay(apiConfig.simulatedLatencyMs);
    this.checkSimulatedErrors();

    // Generate readable reference code like ACM-2026-7841
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingReference = `ACM-2026-${randomSuffix}`;

    const newBooking: MechanicBooking = {
      ...bookingData,
      id: `book-${Date.now()}`,
      bookingReference,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      assignedTechnician: {
        name: 'Dan Kowalski (ASE Master Tech)',
        certifications: ['ASE A1-A8 Master Automobile', 'Advanced Engine Performance (L1)', 'EV/Hybrid Safety'],
        rating: 4.96,
        experienceYears: 28,
      },
    };

    const bookings = this.loadStoredBookings();
    bookings.unshift(newBooking);
    this.saveStoredBookings(bookings);

    // Also link booking to session if available
    const sessions = this.loadStoredSessions();
    const activeSession = sessions.find((s) => s.latestDiagnosis?.id === bookingData.attachedDiagnosis?.id);
    if (activeSession) {
      activeSession.booking = newBooking;
      this.saveStoredSessions(sessions);
    }

    return newBooking;
  }

  /**
   * Django Endpoint: GET /api/v1/bookings/
   */
  public async getBookings(): Promise<MechanicBooking[]> {
    await delay(apiConfig.simulatedLatencyMs / 2);
    return this.loadStoredBookings();
  }

  /**
   * Helper to construct a clean fresh session
   */
  private createDefaultSession(vehicle: VehicleProfile, title = 'New Car Diagnostic'): ChatSession {
    const welcomeMsg: ChatMessage = {
      id: `msg-intro-${Date.now()}`,
      sender: 'assistant',
      content: `Hello! I'm **Dan Kowalski**, your virtual ASE-certified Master Automobile Technician.\n\nI'm here to help you troubleshoot whatever's happening with your **${vehicle.year} ${vehicle.make} ${vehicle.model}** (${vehicle.mileage} miles).\n\nTo begin, what symptoms have you noticed? Feel free to describe any sounds, smells, warning lights, or changes in how the car drives. You can also upload photos, audio clips of the noise, or dash videos!`,
      timestamp: new Date().toISOString(),
      followUpQuestions: [
        'What noise or warning light are you experiencing?',
        'Does it happen when driving, idling, or braking?',
        'Has any recent service been performed on the car?',
      ],
      suggestedReplies: [
        'My brakes are squealing when I slow down',
        'Check engine light is flashing and engine is shaking',
        'Engine has a ticking sound that gets faster with revs',
        'A/C is blowing hot air and coolant smells sweet',
      ],
      status: 'sent',
    };

    return {
      id: `session-${Date.now()}`,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      vehicle: { ...vehicle },
      messages: [welcomeMsg],
      isDiagnosed: false,
    };
  }
}

export const apiClient = new MechanicApiClient();
