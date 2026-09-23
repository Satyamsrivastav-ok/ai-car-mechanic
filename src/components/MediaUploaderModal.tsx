import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Camera,
  Mic,
  Video,
  Play,
  Pause,
  Trash2,
  FileCheck,
  Disc,
} from 'lucide-react';
import { MediaAttachment } from '../types/mechanic';
import { SAMPLE_PRESETS } from '../data/samplePresets';

interface MediaUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachMedia: (attachment: MediaAttachment) => void;
}

export const MediaUploaderModal: React.FC<MediaUploaderModalProps> = ({
  isOpen,
  onClose,
  onAttachMedia,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'record_audio' | 'presets'>('upload');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    };
  }, [recordedAudioUrl]);

  if (!isOpen) return null;

  // File drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setIsProcessing(true);
    let type: 'image' | 'audio' | 'video' = 'image';
    if (file.type.startsWith('audio/')) type = 'audio';
    else if (file.type.startsWith('video/')) type = 'video';

    const reader = new FileReader();
    reader.onload = () => {
      const attachment: MediaAttachment = {
        id: `media-${Date.now()}`,
        type,
        url: reader.result as string,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || `${type}/*`,
        description: `Uploaded ${file.name}`,
      };
      setIsProcessing(false);
      onAttachMedia(attachment);
      onClose();
    };
    reader.onerror = () => {
      setIsProcessing(false);
      alert('Failed to read file. Please try another file.');
    };
    reader.readAsDataURL(file);
  };

  // Browser Microphone Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioBlob(audioBlob);
        setRecordedAudioUrl(audioUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone', err);
      alert('Unable to access microphone. Please check your browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleUseRecordedAudio = () => {
    if (!recordedAudioBlob || !recordedAudioUrl) return;

    const reader = new FileReader();
    reader.onload = () => {
      const attachment: MediaAttachment = {
        id: `rec-${Date.now()}`,
        type: 'audio',
        url: reader.result as string,
        fileName: `recorded_engine_sound_${recordingDuration}s.webm`,
        fileSize: recordedAudioBlob.size,
        mimeType: 'audio/webm',
        duration: recordingDuration,
        description: `Live recorded vehicle sound (${recordingDuration} seconds)`,
      };
      onAttachMedia(attachment);
      onClose();
    };
    reader.readAsDataURL(recordedAudioBlob);
  };

  // Attach from presets
  const handleSelectPresetMedia = (media: MediaAttachment) => {
    onAttachMedia(media);
    onClose();
  };

  // Gather preset media items
  const allSampleMedia = SAMPLE_PRESETS.flatMap((p) => p.sampleMedia || []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Vehicle Media Inspector</h3>
              <p className="text-xs text-slate-400">Attach photos, sounds, or video for diagnostic analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-4 font-medium text-xs sm:text-sm border-b-2 flex items-center gap-2 transition ${
              activeTab === 'upload'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload File
          </button>
          <button
            onClick={() => setActiveTab('record_audio')}
            className={`py-3 px-4 font-medium text-xs sm:text-sm border-b-2 flex items-center gap-2 transition ${
              activeTab === 'record_audio'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-4 h-4" />
            Record Engine Sound
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-4 font-medium text-xs sm:text-sm border-b-2 flex items-center gap-2 transition ${
              activeTab === 'presets'
                ? 'border-amber-500 text-amber-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Disc className="w-4 h-4" />
            Sample Garage Media
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'upload' && (
            <div>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                  dragActive
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-700 bg-slate-950/40 hover:border-slate-500 hover:bg-slate-800/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,audio/*,video/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200 mb-1">
                  Drag and drop your file here, or click to browse
                </h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Supports vehicle photos (rotors, engine, leaks), audio recordings (squeals, knocks), or brief video clips.
                </p>

                <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-blue-400" /> JPG, PNG, WEBP
                  </span>
                  <span className="flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5 text-amber-400" /> MP3, WAV, WEBM
                  </span>
                  <span className="flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-purple-400" /> MP4, MOV
                  </span>
                </div>
              </div>

              {isProcessing && (
                <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-amber-400">
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span>Processing vehicle media...</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'record_audio' && (
            <div className="text-center py-4 space-y-5">
              <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 text-left text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-amber-400 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5" /> Mechanic Audio Capture Guide
                </p>
                <p>
                  Hold your phone or microphone safe from moving fan belts and hot manifolds. Record for 5-15 seconds while replicating the sound (idling, revving, or braking).
                </p>
              </div>

              {/* Visual status */}
              <div className="flex flex-col items-center justify-center">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isRecording
                      ? 'bg-red-500/20 text-red-400 ring-8 ring-red-500/30 animate-pulse'
                      : recordedAudioBlob
                      ? 'bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Mic className="w-10 h-10" />
                </div>

                <div className="mt-3">
                  {isRecording ? (
                    <div className="text-red-400 font-mono font-bold text-lg">
                      Recording: 00:{recordingDuration < 10 ? `0${recordingDuration}` : recordingDuration}
                    </div>
                  ) : recordedAudioBlob ? (
                    <div className="text-emerald-400 text-sm font-medium">
                      Captured {recordingDuration}s vehicle sound recording
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">Ready to record audio clip</div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3">
                {!isRecording && !recordedAudioBlob && (
                  <button
                    onClick={startRecording}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium text-sm rounded-xl shadow-lg transition flex items-center gap-2"
                  >
                    <Mic className="w-4 h-4" /> Start Audio Recording
                  </button>
                )}

                {isRecording && (
                  <button
                    onClick={stopRecording}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm rounded-xl border border-red-500/50 shadow-lg transition flex items-center gap-2"
                  >
                    <div className="w-3 h-3 bg-red-500 rounded-xs" /> Stop & Inspect
                  </button>
                )}

                {recordedAudioBlob && !isRecording && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (audioElementRef.current) {
                          if (isPlayingAudio) {
                            audioElementRef.current.pause();
                            setIsPlayingAudio(false);
                          } else {
                            audioElementRef.current.play();
                            setIsPlayingAudio(true);
                          }
                        }
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5"
                    >
                      {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      {isPlayingAudio ? 'Pause' : 'Play Back'}
                    </button>
                    <button
                      onClick={() => {
                        setRecordedAudioBlob(null);
                        setRecordedAudioUrl(null);
                        setRecordingDuration(0);
                      }}
                      className="px-3 py-2 bg-slate-800/80 hover:bg-red-900/30 text-slate-400 hover:text-red-400 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Re-record
                    </button>
                    <button
                      onClick={handleUseRecordedAudio}
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg shadow-md transition flex items-center gap-1.5"
                    >
                      <FileCheck className="w-3.5 h-3.5" /> Attach to Chat
                    </button>
                  </div>
                )}
              </div>

              {recordedAudioUrl && (
                <audio
                  ref={audioElementRef}
                  src={recordedAudioUrl}
                  onEnded={() => setIsPlayingAudio(false)}
                  className="hidden"
                />
              )}
            </div>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Don't have your own car media files handy? Pick a sample garage asset to test Dan's media inspection reasoning:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {allSampleMedia.map((media) => (
                  <div
                    key={media.id}
                    onClick={() => handleSelectPresetMedia(media)}
                    className="p-3 bg-slate-950/60 border border-slate-800 hover:border-amber-500/60 rounded-xl cursor-pointer hover:bg-slate-800/50 transition flex items-start gap-3 group"
                  >
                    {media.type === 'image' && (
                      <img
                        src={media.url}
                        alt={media.fileName}
                        className="w-14 h-14 rounded-lg object-cover border border-slate-700 group-hover:border-amber-400 shrink-0"
                      />
                    )}
                    {media.type === 'audio' && (
                      <div className="w-14 h-14 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                        <Mic className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-200 truncate group-hover:text-amber-400">
                          {media.fileName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                        {media.description}
                      </p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-semibold tracking-wider text-amber-500/90 bg-amber-500/10 px-1.5 py-0.5 rounded-sm">
                        {media.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
