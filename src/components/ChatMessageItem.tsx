import React, { useState, useRef } from 'react';
import {
  Wrench,
  User,
  Volume2,
  Play,
  Pause,
  Maximize2,
  X,
  HelpCircle,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Film,
} from 'lucide-react';
import {
  ChatMessage,
  DiagnosticReport,
  MediaAttachment,
} from '../types/mechanic';
import { DiagnosticCard } from './DiagnosticCard';

interface ChatMessageItemProps {
  message: ChatMessage;
  onSelectSuggestion?: (text: string) => void;
  onBookMechanic: (diagnosis: DiagnosticReport) => void;
  onRetryMessage?: (message: ChatMessage) => void;
  isBooked?: boolean;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onSelectSuggestion,
  onBookMechanic,
  onRetryMessage,
  isBooked = false,
}) => {
  const isAssistant = message.sender === 'assistant';
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div
      className={`flex flex-col mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        isAssistant ? 'items-start' : 'items-end'
      }`}
    >
      <div
        className={`flex items-start gap-3 max-w-[92%] sm:max-w-[85%] md:max-w-[78%] ${
          isAssistant ? 'flex-row' : 'flex-row-reverse'
        }`}
      >
        {/* Avatar */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
            isAssistant
              ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400/30'
              : 'bg-slate-700 text-slate-200'
          }`}
        >
          {isAssistant ? <Wrench className="w-5 h-5" /> : <User className="w-5 h-5" />}
        </div>

        {/* Message Content Bubble */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-300">
              {isAssistant ? 'AI Car Mechanic' : 'You'}
            </span>
            <span className="text-[10px] text-slate-500">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {message.isOffTopic && (
              <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.2 rounded-sm font-semibold">
                Off-Topic Filter
              </span>
            )}
          </div>

          <div
            className={`rounded-2xl p-4 sm:p-5 text-sm leading-relaxed shadow-lg ${
              isAssistant
                ? 'bg-slate-800/95 text-slate-100 border border-slate-700/80 rounded-tl-xs'
                : 'bg-amber-600 text-slate-950 font-medium rounded-tr-xs'
            }`}
          >
            {/* Formatted Text Content */}
            <div className="whitespace-pre-line space-y-2">
              {message.content.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx}>
                  {paragraph.split('**').map((part, idx) =>
                    idx % 2 === 1 ? (
                      <strong key={idx} className={isAssistant ? 'text-amber-400 font-semibold' : 'text-slate-950 font-bold'}>
                        {part}
                      </strong>
                    ) : (
                      part
                    )
                  )}
                </p>
              ))}
            </div>

            {/* Attachments Section */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-2.5">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 block">
                  Shared vehicle media ({message.attachments.length})
                </span>
                <div className="grid grid-cols-1 gap-2.5">
                  {message.attachments.map((attachment) => (
                    <MediaAttachmentItem
                      key={attachment.id}
                      attachment={attachment}
                      onExpandImage={(url) => setSelectedImage(url)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Error state with retry */}
            {message.status === 'error' && (
              <div className="mt-3 pt-2 border-t border-red-800 flex items-center justify-between text-xs text-red-300">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Message failed to deliver
                </span>
                {onRetryMessage && (
                  <button
                    onClick={() => onRetryMessage(message)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-red-900/40 hover:bg-red-900/60 rounded-md text-red-200 text-xs font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" /> Retry
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Structured Diagnostic Card component */}
          {message.diagnosis && (
            <DiagnosticCard
              diagnosis={message.diagnosis}
              onBookMechanic={onBookMechanic}
              isBooked={isBooked}
            />
          )}

          {/* Follow-up Questions Callout */}
          {isAssistant && message.followUpQuestions && message.followUpQuestions.length > 0 && !message.diagnosis && (
            <div className="mt-3 p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mb-2">
                <HelpCircle className="w-3.5 h-3.5" /> Technician Follow-Up Inquiries:
              </span>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                {message.followUpQuestions.map((q, qIdx) => (
                  <li key={qIdx} className="leading-normal">
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Quick Replies */}
          {isAssistant && message.suggestedReplies && message.suggestedReplies.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.suggestedReplies.map((reply, rIdx) => (
                <button
                  key={rIdx}
                  onClick={() => onSelectSuggestion && onSelectSuggestion(reply)}
                  className="text-xs bg-slate-800/90 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700/80 hover:border-amber-500/40 px-3 py-1.5 rounded-full transition flex items-center gap-1.5 text-left active:scale-98 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{reply}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs cursor-pointer animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Expanded vehicle inspection photo"
              className="max-w-full max-h-[85vh] rounded-xl object-contain border border-slate-700 shadow-2xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-3 -right-3 bg-slate-900 text-white p-2 rounded-full border border-slate-700 hover:bg-slate-800 shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Media attachment sub-renderer (Audio, Image, Video)
 */
interface MediaAttachmentItemProps {
  attachment: MediaAttachment;
  onExpandImage: (url: string) => void;
}

const MediaAttachmentItem: React.FC<MediaAttachmentItemProps> = ({
  attachment,
  onExpandImage,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  if (attachment.type === 'image') {
    return (
      <div className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-w-sm">
        <img
          src={attachment.url}
          alt={attachment.fileName}
          className="w-full h-44 object-cover group-hover:scale-102 transition duration-300 cursor-pointer"
          onClick={() => onExpandImage(attachment.url)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 p-2.5 flex flex-col justify-end pointer-events-none">
          <span className="text-xs font-semibold text-white truncate">
            {attachment.fileName}
          </span>
          {attachment.description && (
            <span className="text-[11px] text-slate-300 line-clamp-1">
              {attachment.description}
            </span>
          )}
        </div>
        <button
          onClick={() => onExpandImage(attachment.url)}
          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-sm"
          title="Zoom image"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (attachment.type === 'audio') {
    return (
      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-700 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAudio}
            className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition shadow-md shrink-0 cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-slate-200 truncate block">
              {attachment.fileName}
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-amber-400" />
              {attachment.duration ? `${attachment.duration}s recording` : 'Audio sample'}
            </span>
          </div>
        </div>

        <audio
          ref={audioRef}
          src={attachment.url}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      </div>
    );
  }

  if (attachment.type === 'video') {
    return (
      <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-w-md">
        <video
          controls
          src={attachment.url}
          className="w-full max-h-52 bg-black"
        />
        <div className="p-2 bg-slate-900 text-xs font-medium text-slate-300 flex items-center gap-2">
          <Film className="w-3.5 h-3.5 text-purple-400" />
          <span className="truncate">{attachment.fileName}</span>
        </div>
      </div>
    );
  }

  return null;
};
