import React, { useState, useRef, useEffect } from 'react';
import { Lesson, InteractiveLabel } from '../../types';
import { avatarAudioEngine } from '../../services/avatarAudioEngine';
import {
  Mic,
  MicOff,
  Send,
  MoreHorizontal,
  Play,
  Volume2,
  Sparkles,
} from 'lucide-react';

interface PrototypeAITutorPanelProps {
  lesson: Lesson;
  onOpenQuiz: () => void;
  onHighlightLabel: (label: InteractiveLabel) => void;
}

export const PrototypeAITutorPanel: React.FC<PrototypeAITutorPanelProps> = ({
  lesson,
  onOpenQuiz,
  onHighlightLabel,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false);

  // Message state seeded with the exact conversation from the user's reference image
  const [chatMessages, setChatMessages] = useState<
    {
      id: string;
      sender: 'user' | 'tutor';
      text: string;
      hasVideoCard?: boolean;
    }[]
  >([
    {
      id: 'msg-1',
      sender: 'user',
      text: 'Can you explain evaporation in simple words?',
    },
    {
      id: 'msg-2',
      sender: 'tutor',
      text: "Evaporation is when water changes from a liquid to a gas (water vapour) because of heat from the sun. Let's see an example.",
      hasVideoCard: true,
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  // Web Speech API
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

      rec.onerror = () => setIsListeningVoice(false);
      rec.onend = () => setIsListeningVoice(false);
      recognitionRef.current = rec;
    }
  }, []);

  const handleToggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListeningVoice) {
      recognitionRef.current.stop();
      setIsListeningVoice(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListeningVoice(true);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    if (text === 'Show a quiz') {
      onOpenQuiz();
      return;
    }

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user' as const,
      text,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // Trigger thinking/analyzing gesture on educator avatar
    avatarAudioEngine.triggerGesture('think', undefined, 2500, 'question');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          lessonTitle: lesson.title,
          subject: lesson.subject,
          grade: 8,
          teacherName: 'Dr. Sarah Jenkins',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.text || 'I understand! Notice how the water cycle continuously circulates matter through thermal radiation.';
        setChatMessages((prev) => [
          ...prev,
          {
            id: `tutor-${Date.now()}`,
            sender: 'tutor',
            text: reply,
          },
        ]);

        // Trigger affirmative nod gesture when answering student question
        avatarAudioEngine.triggerGesture('nod', undefined, 3500, 'question');
        avatarAudioEngine.speak(reply, 'Kore');
      } else {
        throw new Error();
      }
    } catch {
      const fallback = `Great inquiry! In Grade 8 Science, heat energy from the sun causes water molecules to gain kinetic energy and ascend. Observe the arrows in our classroom model.`;
      setChatMessages((prev) => [
        ...prev,
        {
          id: `tutor-${Date.now()}`,
          sender: 'tutor',
          text: fallback,
        },
      ]);
      // Trigger affirmative nod gesture on fallback answer
      avatarAudioEngine.triggerGesture('nod', undefined, 3500, 'question');
      avatarAudioEngine.speak(fallback, 'Kore');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 flex flex-col justify-between h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-cyan-50 border border-cyan-100 flex items-center justify-center shadow-xs">
            <img
              src="./assets/prototype/tutor-robot.png"
              alt="AI Tutor Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 leading-tight">AI Tutor</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold text-emerald-600">Online</span>
            </div>
          </div>
        </div>

        <button className="text-slate-400 hover:text-slate-600 p-1">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1 scrollbar-thin">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full overflow-hidden bg-cyan-50 shrink-0 mt-0.5 border border-cyan-100">
                  <img
                    src="./assets/prototype/tutor-robot.png"
                    alt="Tutor"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className={`space-y-2 max-w-[86%] ${isUser ? 'text-right' : 'text-left'}`}>
                {/* Speech Bubble */}
                <div
                  className={`text-xs sm:text-[13px] leading-relaxed p-3.5 shadow-xs font-normal ${
                    isUser
                      ? 'bg-[#e0edff] text-slate-800 rounded-2xl rounded-tr-xs ml-auto inline-block'
                      : 'bg-[#f8fafc] border border-slate-100 text-slate-800 rounded-2xl rounded-tl-xs'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Embedded Video Animation Card (as in the reference image) */}
                {msg.hasVideoCard && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-900 shadow-sm relative group">
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      <img
                        src="./assets/prototype/thumb-evaporation-anim.png"
                        alt="Animation Evaporation"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Play Button Overlay */}
                      <button
                        onClick={() => {
                          setIsPlayingVideo(!isPlayingVideo);
                          avatarAudioEngine.speak(
                            'Thermal radiation from the sun energizes water molecules at the surface, causing evaporation into rising water vapor.',
                            'Kore'
                          );
                        }}
                        className="absolute inset-0 m-auto w-11 h-11 rounded-full bg-white/85 hover:bg-white text-blue-600 flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
                      >
                        <Play className="w-5 h-5 ml-0.5 fill-current" />
                      </button>
                    </div>
                    <div className="p-2 bg-white text-center border-t border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-700">
                        Animation: Evaporation
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-9">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
            <span>AI Tutor is formulating response...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Prompt Pills (Exact match from reference image) */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { label: 'Explain more', text: 'Can you explain the detailed thermodynamic stages of this cycle?' },
          { label: 'Give an example', text: 'Could you give an everyday real-world example of evaporation and condensation?' },
          { label: 'Show a quiz', text: 'Show a quiz' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => handleSend(item.text)}
            className="px-3 py-1.5 rounded-xl bg-[#e0edff] hover:bg-blue-600 hover:text-white text-[#2563eb] text-[11px] font-semibold whitespace-nowrap transition-colors shadow-2xs"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Input Field (Exact match from reference image) */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-2.5 relative flex items-center"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isListeningVoice ? 'Listening...' : 'Ask me anything...'}
          className="w-full bg-[#f8fafc] border border-slate-200/90 rounded-2xl pl-4 pr-20 py-2.5 text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
        />

        <div className="absolute right-1.5 flex items-center gap-1">
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-1.5 rounded-xl transition-colors ${
              isListeningVoice ? 'text-rose-500 animate-pulse' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-1.5 rounded-xl bg-[#2563eb] hover:bg-blue-600 disabled:opacity-40 text-white transition-all shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
