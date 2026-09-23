/**
 * AI Car Mechanic - Main Application Entry
 *
 * Modern, responsive virtual automotive technician web application.
 * Built with a decoupled service layer ready to connect to a Django REST backend.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ChatSession,
  ChatMessage,
  DiagnosticReport,
  MediaAttachment,
  MechanicBooking,
  VehicleProfile,
} from './types/mechanic';
import { apiClient, DEFAULT_VEHICLE } from './services/apiClient';
import { DiagnosticPreset } from './data/samplePresets';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { MediaUploaderModal } from './components/MediaUploaderModal';
import { BookingModal } from './components/BookingModal';
import { VehicleModal } from './components/VehicleModal';
import { ApiSimulatorModal } from './components/ApiSimulatorModal';
import { PresetsModal } from './components/PresetsModal';

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState<boolean>(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState<boolean>(false);
  const [isApiSimulatorOpen, setIsApiSimulatorOpen] = useState<boolean>(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState<boolean>(false);

  // Diagnosis target for booking
  const [targetDiagnosis, setTargetDiagnosis] = useState<DiagnosticReport | null>(null);

  // Load initial sessions from service layer
  const loadSessions = useCallback(async () => {
    try {
      const data = await apiClient.getSessions();
      setSessions(data);
      if (data.length > 0 && !currentSessionId) {
        setCurrentSessionId(data[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load sessions', err);
      setError(err.message || 'Unable to retrieve diagnostic history.');
    } finally {
      setIsInitializing(false);
    }
  }, [currentSessionId]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Current active session
  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0] || null;

  // Handler: Start New Diagnostic Session
  const handleNewSession = async (
    vehicle: VehicleProfile = currentSession?.vehicle || DEFAULT_VEHICLE,
    title = 'New Car Diagnostic'
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const newSession = await apiClient.createSession(vehicle, title);
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setIsSidebarOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize new consultation session.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Delete Session
  const handleDeleteSession = async (sessionId: string) => {
    try {
      await apiClient.deleteSession(sessionId);
      const remaining = sessions.filter((s) => s.id !== sessionId);
      setSessions(remaining);
      if (currentSessionId === sessionId) {
        setCurrentSessionId(remaining[0]?.id || '');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove session.');
    }
  };

  // Handler: Update Vehicle Details
  const handleSaveVehicle = async (vehicle: VehicleProfile) => {
    if (!currentSession) return;
    try {
      const updated = await apiClient.updateVehicle(currentSession.id, vehicle);
      setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (err: any) {
      setError(err.message || 'Failed to update vehicle specifications.');
    }
  };

  // Handler: Send Message
  const handleSendMessage = async (text: string, attachments: MediaAttachment[] = []) => {
    if (!currentSession) return;

    setIsLoading(true);
    setError(null);

    // Optimistically push user message to UI immediately
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? attachments : undefined,
      status: 'sending',
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSession.id) {
          return {
            ...s,
            messages: [...s.messages, tempUserMsg],
          };
        }
        return s;
      })
    );

    try {
      const result = await apiClient.sendMessage(currentSession.id, text, attachments);

      // Update session with confirmed messages from API
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSession.id) {
            // Replace optimistic message and append assistant response
            const cleaned = s.messages.filter((m) => m.id !== tempUserMsg.id);
            return {
              ...s,
              title: s.title === 'New Car Diagnostic' && text ? `${text.slice(0, 32)}...` : s.title,
              messages: [...cleaned, result.userMessage, result.assistantMessage],
              latestDiagnosis: result.diagnosis || s.latestDiagnosis,
              isDiagnosed: !!(result.diagnosis || s.latestDiagnosis),
              updatedAt: new Date().toISOString(),
            };
          }
          return s;
        })
      );
    } catch (err: any) {
      console.error('Send message failed', err);
      setError(err.message || 'Service communication error. Please retry.');

      // Mark the temp message with error status
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === currentSession.id) {
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === tempUserMsg.id
                  ? { ...m, status: 'error', errorMessage: err.message }
                  : m
              ),
            };
          }
          return s;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Retry Failed Message
  const handleRetryMessage = async (failedMsg: ChatMessage) => {
    // Remove the failed message and re-send
    if (!currentSession) return;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSession.id) {
          return {
            ...s,
            messages: s.messages.filter((m) => m.id !== failedMsg.id),
          };
        }
        return s;
      })
    );
    await handleSendMessage(failedMsg.content, failedMsg.attachments || []);
  };

  // Handler: Open Booking Flow with Diagnosis
  const handleOpenBooking = (diagnosis: DiagnosticReport) => {
    setTargetDiagnosis(diagnosis);
    setIsBookingModalOpen(true);
  };

  // Handler: Booking Confirmed Success
  const handleBookingSuccess = (booking: MechanicBooking) => {
    if (!currentSession) return;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSession.id) {
          return {
            ...s,
            booking,
          };
        }
        return s;
      })
    );
  };

  // Handler: Load Preset Demo Scenario
  const handleSelectPreset = async (preset: DiagnosticPreset) => {
    setIsLoading(true);
    setError(null);
    try {
      // Create fresh consultation session with preset vehicle and title
      const newSession = await apiClient.createSession(preset.vehicle, preset.title);
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setIsSidebarOpen(false);

      // Automatically dispatch initial user message with attached media assets
      await apiClient.sendMessage(
        newSession.id,
        preset.initialUserMessage,
        preset.sampleMedia || []
      );

      // Reload fresh session state from client
      const updated = await apiClient.getSession(newSession.id);
      if (updated) {
        setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize demo scenario.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state placeholder
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold text-white">Starting AI Car Mechanic...</h2>
        <p className="text-xs text-slate-400 mt-1">
          Initializing ASE Master Technician diagnostic service layer
        </p>
      </div>
    );
  }

  const activeVehicle: VehicleProfile = currentSession?.vehicle || DEFAULT_VEHICLE;
  const activeDiagnosis: DiagnosticReport =
    targetDiagnosis ||
    currentSession?.latestDiagnosis || {
      id: 'DIAG-REF-PRE',
      problemSummary: 'Automotive Diagnostic Assessment',
      possibleCauses: [],
      mostLikelyIssue: 'Vehicle Diagnostic Inspection',
      recommendedRepair: 'Multi-Point Inspection',
      urgency: 'Medium',
      urgencyReason: 'Requires shop verification',
      canDriveSafely: true,
      drivingAdvice: 'Drive with caution',
      estimatedCost: {
        min: 150,
        max: 350,
        currency: 'USD',
        partsEstimate: 80,
        laborEstimate: 120,
      },
      confidenceScore: 85,
      requiresPhysicalInspection: true,
      disclaimer: 'Inspection required by certified technician.',
      createdAt: new Date().toISOString(),
    };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Consultation Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => setCurrentSessionId(id)}
        onNewSession={() => handleNewSession()}
        onDeleteSession={handleDeleteSession}
        currentVehicle={activeVehicle}
        onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
        onSelectPreset={handleSelectPreset}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header
          currentSession={currentSession}
          onNewSession={() => handleNewSession()}
          onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
          onOpenApiSimulator={() => setIsApiSimulatorOpen(true)}
          onOpenPresetsModal={() => setIsPresetsModalOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-hidden flex flex-col">
          <ChatArea
            messages={currentSession?.messages || []}
            vehicle={activeVehicle}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onBookMechanic={handleOpenBooking}
            onOpenMediaModal={() => setIsMediaModalOpen(true)}
            onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
            onRetryMessage={handleRetryMessage}
            error={error}
            onClearError={() => setError(null)}
            isBooked={!!currentSession?.booking}
          />
        </main>
      </div>

      {/* Vehicle Specifications Modal */}
      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        currentVehicle={activeVehicle}
        onSaveVehicle={handleSaveVehicle}
      />

      {/* Media Uploader & Microphone Recorder Modal */}
      <MediaUploaderModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onAttachMedia={(attachment) => {
          // Send immediately or attach to prompt
          handleSendMessage(
            `I have attached a vehicle media file for inspection: ${attachment.fileName} (${attachment.description || attachment.type})`,
            [attachment]
          );
        }}
      />

      {/* Booking & Work Order Confirmation Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        diagnosis={activeDiagnosis}
        vehicle={activeVehicle}
        onBookingSuccess={handleBookingSuccess}
        existingBooking={currentSession?.booking}
      />

      {/* API Simulator & Django REST Architecture Modal */}
      <ApiSimulatorModal
        isOpen={isApiSimulatorOpen}
        onClose={() => setIsApiSimulatorOpen(false)}
      />

      {/* Interactive Demo Presets Modal */}
      <PresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        onSelectPreset={handleSelectPreset}
      />
    </div>
  );
}
