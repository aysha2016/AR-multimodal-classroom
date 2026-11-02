import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Lesson, TeacherAvatarConfig, InteractiveLabel } from '../../types';
import { avatarAudioEngine } from '../../services/avatarAudioEngine';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Trash2,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  HelpCircle,
  FileQuestion,
  Lightbulb,
} from 'lucide-react';

interface AITutorPanelProps {
  currentTeacher: TeacherAvatarConfig;
  lesson: Lesson;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearMessages: () => void;
  onOpenQuiz: () => void;
  onHighlightLabel: (label: InteractiveLabel) => void;
  isLoading: boolean;
}

export const AITutorPanel: React.FC<AITutorPanelProps> = ({
  currentTeacher,
  lesson,
  messages,
  onSendMessage,
  onClearMessages,
  onOpenQuiz,
  onHighlightLabel,
  isLoading,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Voice Input with Web Speech API
  useEffect(() => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      const rec = new SpeechRecognitionClass();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };

      rec.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListeningVoice(false);
        setVoiceError('Voice input error. Please type or check microphone.');
        setTimeout(() => setVoiceError(null), 3500);
      };

      rec.onend = () => {
        setIsListeningVoice(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleToggleVoice = () => {
    if (!recognitionRef.current) {
      setVoiceError('Speech recognition is not supported in this browser.');
      setTimeout(() => setVoiceError(null), 3000);
      return;
    }

    if (isListeningVoice) {
      recognitionRef.current.stop();
      setIsListeningVoice(false);
    } else {
      setVoiceError(null);
      try {
        recognitionRef.current.start();
        setIsListeningVoice(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleSuggestedPrompt = (promptText: string) => {
    if (promptText === 'Give me a quiz') {
      onOpenQuiz();
      return;
    }
    onSendMessage(promptText);
  };

  const handleSpeakMessage = (msg: ChatMessage) => {
    avatarAudioEngine.speak(msg.text, currentTeacher.voiceName);
  };

  // Find if a word in tutor's response corresponds to an interactive label
  const renderMessageContent = (text: string) => {
    // Check for matching labels in lesson
    const labelNames = lesson.labels.map((l) => l.name);

    return (
      <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
        {text}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-blue-500/50 relative shadow-sm">
            <img
              src={currentTeacher.avatarImage}
              alt={currentTeacher.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-tight">{currentTeacher.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-medium">
                Tutor
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {isLoading ? 'Thinking & Synthesizing...' : 'Adaptive Learning Assistant'}
            </p>
          </div>
        </div>

        <button
          onClick={onClearMessages}
          title="Clear Conversation"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-900/60">
        {messages.map((msg) => {
          const isTutor = msg.sender === 'tutor';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isTutor ? 'justify-start' : 'justify-end'}`}
            >
              {isTutor && (
                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5 border border-blue-400/30">
                  <img
                    src={currentTeacher.avatarImage}
                    alt={currentTeacher.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm text-xs sm:text-sm ${
                  isTutor
                    ? 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-sm'
                    : 'bg-blue-600 text-white rounded-tr-sm shadow-blue-600/20'
                }`}
              >
                {renderMessageContent(msg.text)}

                {/* Footer with Timestamp & Speak Button */}
                <div
                  className={`flex items-center justify-between gap-3 mt-1.5 pt-1 border-t text-[10px] ${
                    isTutor ? 'border-slate-700/60 text-slate-400' : 'border-blue-500/50 text-blue-200'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {isTutor && (
                    <button
                      onClick={() => handleSpeakMessage(msg)}
                      title="Read aloud with synchronized avatar"
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Speak</span>
                    </button>
                  )}
                </div>
              </div>

              {!isTutor && (
                <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Live Typing / Synthesizing Indicator */}
        {isLoading && (
          <div className="flex gap-2.5 items-center">
            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-blue-400/30">
              <img
                src={currentTeacher.avatarImage}
                alt={currentTeacher.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 px-3.5 py-2.5 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] text-slate-400 ml-1.5 font-medium">Tutor is preparing response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="px-3 py-2 bg-slate-900 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] text-slate-400 uppercase font-semibold shrink-0">Prompts:</span>
          {[
            { label: 'Explain more', text: 'Can you explain the key steps of this process in more detail?' },
            { label: 'Give an example', text: 'Could you give a real-world everyday example of this concept?' },
            { label: 'Show a diagram', text: 'How does this appear on the 2D diagram and in 3D?' },
            { label: 'Make it easier', text: 'Can you explain this in simpler words for a beginner?' },
            { label: 'Give me a quiz', text: 'Give me a quiz' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestedPrompt(item.text)}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 border border-slate-700 shrink-0 transition-all font-medium disabled:opacity-50"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Error notice if any */}
      {voiceError && (
        <div className="px-3 py-1 bg-rose-500/10 border-t border-rose-500/20 text-rose-300 text-[11px] text-center">
          {voiceError}
        </div>
      )}

      {/* Text Input & Mic Form */}
      <form onSubmit={handleSend} className="p-3 bg-slate-850 border-t border-slate-800 flex items-center gap-2">
        <button
          type="button"
          onClick={handleToggleVoice}
          title={isListeningVoice ? 'Stop listening' : 'Ask question with voice'}
          className={`p-2 rounded-xl transition-all ${
            isListeningVoice
              ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
          }`}
        >
          {isListeningVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isListeningVoice ? 'Listening to your voice...' : 'Ask your AI tutor a question...'}
          disabled={isLoading}
          className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 transition-colors shadow-md shadow-blue-600/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
