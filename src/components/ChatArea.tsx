import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Mic,
  Camera,
  Wrench,
  Loader2,
  X,
  Volume2,
  Film,
  Sparkles,
  Car,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import {
  ChatMessage,
  DiagnosticReport,
  MediaAttachment,
  VehicleProfile,
} from '../types/mechanic';
import { ChatMessageItem } from './ChatMessageItem';

interface ChatAreaProps {
  messages: ChatMessage[];
  vehicle: VehicleProfile;
  isLoading: boolean;
  onSendMessage: (text: string, attachments: MediaAttachment[]) => Promise<void>;
  onBookMechanic: (diagnosis: DiagnosticReport) => void;
  onOpenMediaModal: () => void;
  onOpenVehicleModal: () => void;
  onRetryMessage?: (message: ChatMessage) => void;
  error?: string | null;
  onClearError?: () => void;
  isBooked?: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  vehicle,
  isLoading,
  onSendMessage,
  onBookMechanic,
  onOpenMediaModal,
  onOpenVehicleModal,
  onRetryMessage,
  error,
  onClearError,
  isBooked = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<MediaAttachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages or typing state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if ((!trimmed && pendingAttachments.length === 0) || isLoading) return;

    const textToSend = trimmed;
    const attachmentsToSend = [...pendingAttachments];

    setInputText('');
    setPendingAttachments([]);

    await onSendMessage(textToSend, attachmentsToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const removePendingAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Helper when user clicks a suggested reply
  const handleSelectSuggestion = (text: string) => {
    setInputText(text);
    inputRef.current?.focus();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900/60 overflow-hidden relative">
      {/* Vehicle Context Ribbon */}
      <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 truncate">
          <Car className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="truncate">
            Active Vehicle:{' '}
            <strong className="text-slate-200">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </strong>{' '}
            ({vehicle.mileage} miles)
          </span>
        </div>
        <button
          onClick={onOpenVehicleModal}
          className="text-amber-400 hover:text-amber-300 font-medium shrink-0 ml-2 hover:underline"
        >
          Change Vehicle
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg">
              <Wrench className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="text-lg font-bold text-white">Start Your Diagnostic Consultation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Describe your car's symptoms or upload photos of parts, dash warning lights, or an audio clip of unusual sounds.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              onSelectSuggestion={handleSelectSuggestion}
              onBookMechanic={onBookMechanic}
              onRetryMessage={onRetryMessage}
              isBooked={isBooked}
            />
          ))
        )}

        {/* Typing / Diagnostic Reasoning Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 animate-in fade-in duration-200">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-slate-300 shadow-md flex items-center gap-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="font-medium text-slate-300">
                Dan Kowalski is evaluating mechanical symptoms & acoustic data...
              </span>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="p-3.5 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-center justify-between gap-3 shadow-lg animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <div className="flex items-center gap-2">
              {onClearError && (
                <button
                  onClick={onClearError}
                  className="text-slate-400 hover:text-white p-1 rounded-sm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Dock */}
      <div className="p-3 sm:p-4 bg-slate-950/90 border-t border-slate-800 backdrop-blur-md">
        {/* Pending Attachments Tray */}
        {pendingAttachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2 animate-in fade-in">
            {pendingAttachments.map((att) => (
              <div
                key={att.id}
                className="bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 shadow-sm"
              >
                {att.type === 'image' && <Camera className="w-3.5 h-3.5 text-blue-400" />}
                {att.type === 'audio' && <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
                {att.type === 'video' && <Film className="w-3.5 h-3.5 text-purple-400" />}
                <span className="max-w-[140px] truncate font-medium">{att.fileName}</span>
                <button
                  onClick={() => removePendingAttachment(att.id)}
                  className="text-slate-400 hover:text-red-400 transition"
                  title="Remove attachment"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Box Row */}
        <div className="flex items-end gap-2 bg-slate-900 border border-slate-700/80 focus-within:border-amber-500 rounded-2xl p-2 transition shadow-inner">
          {/* Attach Media Button */}
          <button
            type="button"
            onClick={onOpenMediaModal}
            className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition shrink-0 cursor-pointer"
            title="Attach vehicle photos, audio sound recording, or video"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Quick Voice / Engine Sound Record Shortcut */}
          <button
            type="button"
            onClick={onOpenMediaModal}
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition shrink-0 hidden xs:block cursor-pointer"
            title="Record engine or brake noise"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Auto-expanding Textarea */}
          <textarea
            ref={inputRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what's wrong (e.g. squeal when braking, flashing CEL, ticking at idle)..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 resize-none focus:outline-hidden py-2 px-1 max-h-32 min-h-[38px]"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={(!inputText.trim() && pendingAttachments.length === 0) || isLoading}
            className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-600 transition shadow-md shrink-0 disabled:cursor-not-allowed cursor-pointer"
            title="Send message to Dan Kowalski"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-2">
          <span>Press Enter to send, Shift + Enter for new line</span>
          <span className="hidden sm:inline">
            ASE Master Tech Virtual Assistance • Certified Mechanical Logic
          </span>
        </div>
      </div>
    </div>
  );
};
