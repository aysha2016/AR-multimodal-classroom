import React, { useEffect, useRef, useState } from 'react';
import { TeacherAvatarConfig, TeacherState, VisemeFrame } from '../../types';
import { avatarAudioEngine, AvatarGestureType, AvatarGestureEvent } from '../../services/avatarAudioEngine';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  UserCheck,
  Layers,
  Compass,
  Hand,
  Check,
  HelpCircle,
  PlayCircle,
} from 'lucide-react';

export interface PhotorealisticTeacherAvatarProps {
  currentTeacher: TeacherAvatarConfig;
  onSwitchTeacher: (teacher: TeacherAvatarConfig) => void;
  availableTeachers: TeacherAvatarConfig[];
  highlightedElement?: string;
  isCompact?: boolean;
  isSpeaking?: boolean;
  speechText?: string;
  className?: string;
}

export const PhotorealisticTeacherAvatar: React.FC<PhotorealisticTeacherAvatarProps> = ({
  currentTeacher,
  onSwitchTeacher,
  availableTeachers,
  highlightedElement,
  isCompact = false,
  isSpeaking: propIsSpeaking,
  speechText,
  className = '',
}) => {
  const [state, setState] = useState<TeacherState>('idle');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [viseme, setViseme] = useState<VisemeFrame>({
    viseme: 'sil',
    jawDrop: 0,
    mouthWidth: 0,
    lipRound: 0,
    teethVisible: false,
    tongueOut: false,
  });

  // Micro-motion & Gesture kinematics
  const [blinkProgress, setBlinkProgress] = useState<number>(0);
  const [breathPhase, setBreathPhase] = useState<number>(0);
  const [headTilt, setHeadTilt] = useState<{ x: number; y: number; r: number }>({ x: 0, y: 0, r: 0 });
  const [gazeOffset, setGazeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeGesture, setActiveGesture] = useState<AvatarGestureType>('rest');
  const [gestureTargetLabel, setGestureTargetLabel] = useState<string | undefined>(highlightedElement);
  const [nodProgress, setNodProgress] = useState<number>(0);

  // Sub-frame smoothed kinematic registers for ultra-natural photographic lip sync
  const [smoothJaw, setSmoothJaw] = useState<number>(0);
  const [smoothWidth, setSmoothWidth] = useState<number>(0);
  const [smoothRound, setSmoothRound] = useState<number>(0);

  // Arm & Hand gesture kinematics registers
  const [armProgress, setArmProgress] = useState<number>(0); // 0 (rest) to 1 (fully extended gesture)

  const smoothJawRef = useRef<number>(0);
  const smoothWidthRef = useRef<number>(0);
  const smoothRoundRef = useRef<number>(0);
  const targetArmRef = useRef<number>(0);
  const currentArmRef = useRef<number>(0);

  const animationFrameRef = useRef<number | null>(null);
  const lastBlinkTimeRef = useRef<number>(Date.now());
  const blinkStateRef = useRef<'open' | 'closing' | 'opening'>('open');
  const nodTimerRef = useRef<number>(0);
  const isNoddingRef = useRef<boolean>(false);

  // Sync highlightedElement prop to pointing gesture
  useEffect(() => {
    if (highlightedElement) {
      setGestureTargetLabel(highlightedElement);
      avatarAudioEngine.triggerGesture('point', highlightedElement, 4500, 'label');
    }
  }, [highlightedElement]);

  // Subscribe to audio engine visemes, state, and gesture events
  useEffect(() => {
    const unsubViseme = avatarAudioEngine.subscribeVisemes((newViseme) => {
      setViseme(newViseme);
    });

    const unsubState = avatarAudioEngine.subscribeState((newState) => {
      setState(newState);
      if (newState === 'thinking') {
        setActiveGesture('think');
      } else if (newState === 'idle' && activeGesture === 'think') {
        setActiveGesture('rest');
      }
    });

    const unsubGesture = avatarAudioEngine.subscribeGesture((event: AvatarGestureEvent) => {
      setActiveGesture(event.gesture);
      if (event.targetLabel) {
        setGestureTargetLabel(event.targetLabel);
      }
      if (event.gesture === 'nod') {
        isNoddingRef.current = true;
        nodTimerRef.current = 0;
      }
    });

    setIsMuted(avatarAudioEngine.getMuted());

    return () => {
      unsubViseme();
      unsubState();
      unsubGesture();
    };
  }, [activeGesture]);

  const isSpeaking = propIsSpeaking || state === 'speaking' || state === 'explaining' || viseme.viseme !== 'sil';

  // Main 60 FPS continuous kinematic loop: respiration, blink, natural lip easing, gestures, nodding
  useEffect(() => {
    let startTime = performance.now();

    const loop = (timestamp: number) => {
      const elapsed = (timestamp - startTime) / 1000;

      // 1. Natural respiratory rhythm (~14 bpm)
      const breath = Math.sin(elapsed * 1.45) * 0.5 + 0.5;
      setBreathPhase(breath);

      // 2. Natural spontaneous blinking (~every 3.6s with random deviation)
      const now = Date.now();
      if (blinkStateRef.current === 'open' && now - lastBlinkTimeRef.current > 3200 + Math.random() * 1400) {
        blinkStateRef.current = 'closing';
        lastBlinkTimeRef.current = now;
      }

      if (blinkStateRef.current === 'closing') {
        setBlinkProgress((prev) => {
          const next = prev + 0.24;
          if (next >= 1) {
            blinkStateRef.current = 'opening';
            return 1;
          }
          return next;
        });
      } else if (blinkStateRef.current === 'opening') {
        setBlinkProgress((prev) => {
          const next = prev - 0.20;
          if (next <= 0) {
            blinkStateRef.current = 'open';
            return 0;
          }
          return next;
        });
      }

      // 3. Affirmative Nodding Dynamics (Double-nod with natural neck damping)
      let nodOffsetY = 0;
      if (isNoddingRef.current) {
        nodTimerRef.current += 0.055;
        const t = nodTimerRef.current;
        // Natural double-nod: dip down, up, dip down, return
        const nodWave = Math.sin(t * 7.5) * Math.exp(-t * 0.9);
        nodOffsetY = nodWave * 3.8;
        setNodProgress(nodWave);
        if (t > 2.8) {
          isNoddingRef.current = false;
          nodTimerRef.current = 0;
          setNodProgress(0);
        }
      }

      // 4. Head & Gaze Dynamics based on active gesture
      if (activeGesture === 'point') {
        // Turn head and glance left toward classroom model
        setHeadTilt({ x: -3.8, y: nodOffsetY + 0.8, r: -1.2 });
        setGazeOffset({ x: -4.5, y: 0.6 });
      } else if (activeGesture === 'think') {
        // Thoughtful upward-left pensive tilt
        setHeadTilt({ x: 3.5, y: -2.2 + nodOffsetY, r: 2.2 });
        setGazeOffset({ x: 3.2, y: -2.8 });
      } else if (activeGesture === 'nod') {
        // Direct eye contact with student during affirmative nod
        setHeadTilt({ x: 0, y: nodOffsetY, r: 0 });
        setGazeOffset({ x: 0, y: 0 });
      } else if (isSpeaking) {
        // Conversational head nods and emphasis tilts
        const nod = Math.sin(elapsed * 3.0) * 1.2 + nodOffsetY;
        const tilt = Math.cos(elapsed * 2.0) * 1.0;
        const roll = Math.sin(elapsed * 1.4) * 0.7;
        setHeadTilt({ x: tilt, y: nod, r: roll });
        setGazeOffset({ x: Math.sin(elapsed * 0.8) * 1.2, y: Math.cos(elapsed * 0.5) * 0.8 });
      } else {
        // Idle gentle posture drift
        const idleX = Math.sin(elapsed * 0.5) * 0.4;
        const idleY = breath * 0.6 + nodOffsetY;
        setHeadTilt({ x: idleX, y: idleY, r: idleX * 0.2 });
        setGazeOffset({ x: Math.sin(elapsed * 0.3) * 0.3, y: 0 });
      }

      // 5. Arm & Hand Gesture Spring Kinematics
      targetArmRef.current = activeGesture === 'point' || activeGesture === 'open-palm' || activeGesture === 'think' ? 1.0 : 0.0;
      currentArmRef.current += (targetArmRef.current - currentArmRef.current) * 0.12;
      setArmProgress(currentArmRef.current);

      // 6. Sub-frame continuous photographic lip sync smoothing (Glides organically at 60 FPS)
      let targetJaw = viseme.jawDrop;
      let targetWidth = viseme.mouthWidth;
      let targetRound = viseme.lipRound;

      if (isSpeaking && viseme.viseme === 'sil') {
        // Conversational speech articulation driver for visible natural mouth movement
        const speechSpeed = 13.5;
        const wave1 = Math.sin(elapsed * speechSpeed);
        const wave2 = Math.sin(elapsed * 6.5);
        const wave3 = Math.cos(elapsed * 21.0);
        const syllableGate = Math.sin(elapsed * 2.8);
        if (syllableGate > -0.35) {
          const raw = Math.max(0, wave1 * 0.58 + wave2 * 0.32 + wave3 * 0.1);
          targetJaw = Math.pow(raw, 1.15) * 0.85; // High visible amplitude
          targetWidth = wave2 * 0.35;
          targetRound = Math.max(0, -wave1 * 0.4);
        } else {
          targetJaw = 0.0;
        }
      } else if (viseme.viseme !== 'sil') {
        targetJaw = Math.min(1.0, viseme.jawDrop * 1.5);
        targetWidth = viseme.mouthWidth * 1.3;
        targetRound = viseme.lipRound * 1.3;
      }

      smoothJawRef.current += (targetJaw - smoothJawRef.current) * 0.32;
      smoothWidthRef.current += (targetWidth - smoothWidthRef.current) * 0.28;
      smoothRoundRef.current += (targetRound - smoothRoundRef.current) * 0.28;

      setSmoothJaw(smoothJawRef.current);
      setSmoothWidth(smoothWidthRef.current);
      setSmoothRound(smoothRoundRef.current);

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [activeGesture, isSpeaking, viseme]);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    avatarAudioEngine.setMuted(next);
  };

  const handleReplay = () => {
    avatarAudioEngine.replay();
  };

  const handleDemonstrateSpeech = () => {
    avatarAudioEngine.triggerGesture('point', gestureTargetLabel || highlightedElement, 4500, 'speech');
    avatarAudioEngine.speak(
      `Hello! I am ${currentTeacher.name}. Welcome to our interactive science classroom. Notice how my lip movements dynamically synchronize with our narration!`,
      currentTeacher.voiceName
    );
  };

  // Manual gesture triggers for student/user testing
  const triggerManualGesture = (g: AvatarGestureType) => {
    avatarAudioEngine.triggerGesture(g, gestureTargetLabel || highlightedElement, 3500, 'user');
  };

  // Status badge styling
  const stateLabels: Record<TeacherState, { label: string; bg: string; dot: string; icon: any }> = {
    idle: { label: 'Online & Attentive', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2 },
    speaking: { label: 'Speaking', bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', icon: Volume2 },
    explaining: { label: 'Explaining 3D Model', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500', icon: Sparkles },
    listening: { label: 'Listening to Student', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', icon: PlayCircle },
    thinking: { label: 'Analyzing Question...', bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500', icon: HelpCircle },
    loading: { label: 'Synthesizing Lesson...', bg: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500', icon: Sparkles },
    error: { label: 'Audio Reconnecting', bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', icon: VolumeX },
  };

  const currentBadge = stateLabels[state] || stateLabels.idle;
  const BadgeIcon = currentBadge.icon;

  // Complete Full-Mouth Articulation Kinematics (in 280 x 350 canvas)
  const isBilabial = viseme.viseme === 'm';
  const jawNorm = Math.min(1.0, smoothJaw);
  const widthNorm = Math.max(-1.0, Math.min(1.0, smoothWidth));
  const roundNorm = Math.max(0.0, Math.min(1.0, smoothRound));

  const upperLipLiftPx = (jawNorm * 3.2 + Math.max(0, widthNorm) * 2.4) - (roundNorm * 2.0);
  const jawDisplacementPx = isBilabial ? -0.8 : jawNorm * 10.5 + roundNorm * 1.5;
  const oralApertureHeight = Math.max(0, upperLipLiftPx + jawDisplacementPx);
  const cornerSpreadPx = widthNorm * 5.0 - roundNorm * 4.2;
  const cornerLiftY = Math.max(0, widthNorm * 2.0) - (jawNorm * 0.8);

  // Eyes coordinates (in 280 x 350 native portrait)
  const leftEyeX = 132;
  const leftEyeY = 112;
  const rightEyeX = 192;
  const rightEyeY = 118;

  return (
    <div
      className={`relative bg-gradient-to-b from-slate-900 via-slate-850 to-slate-950 rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden flex flex-col ${
        isCompact ? 'h-full' : 'w-full'
      } ${className}`}
    >
      {/* Top Header Card */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${currentBadge.dot}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-tight">{currentTeacher.name}</h3>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                AI Educator
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[190px]">{currentTeacher.title}</p>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute Teacher Audio' : 'Mute Teacher Audio'}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              isMuted
                ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleReplay}
            title="Replay Spoken Explanation"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Avatar Visual Viewport */}
      <div className="relative flex-1 w-full min-h-[320px] sm:min-h-[380px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
        {/* Subtle studio back-lighting effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(59,130,246,0.18),transparent_70%)] pointer-events-none" />

        {/* Live Status Floating Pill */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shadow-sm backdrop-blur-md bg-slate-900/80 border-slate-700 text-slate-200">
          <BadgeIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>{currentBadge.label}</span>
          {activeGesture !== 'rest' && (
            <span className="font-mono text-[10px] text-cyan-300 uppercase tracking-wider ml-1 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60">
              {activeGesture === 'point' ? '👉 POINTING' : activeGesture === 'nod' ? '🤝 NODDING' : activeGesture === 'think' ? '🤔 PONDERING' : '👋 EXPLAINING'}
            </span>
          )}
        </div>

        {/* Active Pointing Hologram Focus Banner */}
        {activeGesture === 'point' && gestureTargetLabel && (
          <div className="absolute top-12 left-3 z-20 bg-blue-600/90 text-white text-xs px-3 py-1.5 rounded-xl shadow-lg border border-blue-400/60 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <Compass className="w-3.5 h-3.5 text-cyan-200 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="font-semibold text-cyan-100">Explaining:</span>
            <span className="font-bold text-white">{gestureTargetLabel}</span>
          </div>
        )}

        {/* Affirmative Nod Feedback Pill */}
        {activeGesture === 'nod' && (
          <div className="absolute top-12 left-3 z-20 bg-emerald-600/90 text-white text-xs px-3 py-1.5 rounded-xl shadow-lg border border-emerald-400/60 flex items-center gap-1.5 animate-in fade-in duration-200">
            <Check className="w-3.5 h-3.5 text-emerald-200" />
            <span className="font-semibold">Affirming student question</span>
          </div>
        )}

        {/* Avatar Anatomical Layered SVG Mesh */}
        <div
          className="relative w-full h-full max-h-[460px] flex items-center justify-center transition-transform duration-75"
          style={{
            transform: `translate3d(${headTilt.x * 0.35}px, ${headTilt.y * 0.35 + breathPhase * 2.5}px, 0px) rotate(${headTilt.r * 0.3}deg)`,
          }}
        >
          {/* Base Photographic Educator Canvas in 280 x 350 ViewBox */}
          <div className="relative w-[280px] h-[350px] rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 bg-slate-950">
            <svg
              viewBox="0 0 280 350"
              className="w-full h-full object-cover object-top select-none pointer-events-none"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                {/* 1. Feathered mask isolating her authentic lower lip and chin from the photograph */}
                <mask id="teacherPhotographicLowerLipMask">
                  <rect x="0" y="0" width="280" height="350" fill="black" />
                  {/* Organic curved vermilion border down to chin */}
                  <path
                    d="M 125 178 Q 153.5 180 182 178.5 C 183 194 172 216 153.5 220 C 135 216 124 194 125 178 Z"
                    fill="white"
                    filter="url(#lipMaskFeather)"
                  />
                </mask>

                <filter id="lipMaskFeather" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="1.0" />
                </filter>

                {/* 2. Realistic Oral Cavity Depth Gradient */}
                <linearGradient id="oralApertureDepthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#140305" />
                  <stop offset="60%" stopColor="#24070b" />
                  <stop offset="100%" stopColor="#380e13" />
                </linearGradient>

                {/* 3. Soft tongue cushion gradient */}
                <linearGradient id="naturalTongueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#b44b58" />
                  <stop offset="100%" stopColor="#7e2732" />
                </linearGradient>

                {/* 4. Natural Eyelid Skin Gradient */}
                <linearGradient id="eyelidSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#d3a793" />
                  <stop offset="100%" stopColor="#b98873" />
                </linearGradient>

                {/* 5. Upper lip vermillion gradient */}
                <linearGradient id="avatarUpperLipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#bf5259" />
                  <stop offset="45%" stopColor="#d56d74" />
                  <stop offset="100%" stopColor="#96373e" />
                </linearGradient>

                {/* 6. Lower teeth enamel gradient */}
                <linearGradient id="avatarLowerTeethGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="60%" stopColor="#f5f0e6" />
                  <stop offset="100%" stopColor="#c5b6a7" />
                </linearGradient>

                <filter id="softSkinBlend" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="0.9" />
                </filter>
                <filter id="cavitySoftEdge" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="0.45" />
                </filter>
              </defs>

              {/* LAYER 1: BASE PHOTOGRAPHIC EDUCATOR IMAGE */}
              <image
                href={currentTeacher.avatarImage || './assets/prototype/teacher-portrait.png'}
                x="0"
                y="0"
                width="280"
                height="350"
                preserveAspectRatio="xMidYMid slice"
              />

              {/* LAYER 2: EYE BLINKING & GAZE TRACKING */}
              <g id="teacherEyes">
                {/* Left Eye Gaze Micro-highlight */}
                {isSpeaking && (
                  <circle
                    cx={leftEyeX + gazeOffset.x}
                    cy={leftEyeY + gazeOffset.y}
                    r="1.2"
                    fill="#ffffff"
                    opacity="0.8"
                  />
                )}

                {/* Right Eye Gaze Micro-highlight */}
                {isSpeaking && (
                  <circle
                    cx={rightEyeX + gazeOffset.x}
                    cy={rightEyeY + gazeOffset.y}
                    r="1.2"
                    fill="#ffffff"
                    opacity="0.8"
                  />
                )}

                {/* Left Eye Progressive Eyelid Blink */}
                {blinkProgress > 0.05 && (
                  <path
                    d={`M 116 113 Q 132 ${113 + blinkProgress * 7.5} 148 114 Q 132 ${113 - (1 - blinkProgress) * 2.5} 116 113 Z`}
                    fill="url(#eyelidSkinGrad)"
                    filter="url(#softSkinBlend)"
                    opacity="0.98"
                  />
                )}

                {/* Right Eye Progressive Eyelid Blink */}
                {blinkProgress > 0.05 && (
                  <path
                    d={`M 176 118 Q 192 ${118 + blinkProgress * 7.5} 208 118 Q 192 ${118 - (1 - blinkProgress) * 2.5} 176 118 Z`}
                    fill="url(#eyelidSkinGrad)"
                    filter="url(#softSkinBlend)"
                    opacity="0.98"
                  />
                )}
              </g>

              {/* LAYER 3: INNER ORAL CAVITY APERTURE, TEETH, TONGUE & FULL LIP VERMILLION */}
              {(isSpeaking || smoothJaw > 0.02) && oralApertureHeight > 0.3 && (() => {
                const lx = 125 - cornerSpreadPx * 0.5;
                const rx = 182 + cornerSpreadPx * 0.5;
                const cornerY = 178.5 - cornerLiftY;
                const upperFissureY = 178.5 - upperLipLiftPx;
                const lowerFissureY = 178.5 + jawDisplacementPx;
                const totalOpening = Math.max(0, lowerFissureY - upperFissureY);
                const cupidTopY = 173.0 - upperLipLiftPx * 0.45;
                const lowerLipBottomY = 189.5 + jawDisplacementPx * 0.82;

                return (
                  <g id="oralAperture" opacity={Math.min(1, smoothJaw * 4.5)}>
                    {/* 1. Deep oral cavity aperture (spanning full mouth width) */}
                    <path
                      d={`M ${lx} ${cornerY}
                          C ${lx + 8} ${upperFissureY - 0.5}, ${rx - 8} ${upperFissureY - 0.5}, ${rx} ${cornerY}
                          C ${rx - 7} ${lowerFissureY + 0.5}, ${lx + 7} ${lowerFissureY + 0.5}, ${lx} ${cornerY} Z`}
                      fill="url(#oralApertureDepthGrad)"
                      filter="url(#cavitySoftEdge)"
                    />

                    {/* 2. Full upper incisor teeth enamel dental arch */}
                    {totalOpening > 1.0 && (
                      <path
                        d={`M ${lx + 4} ${cornerY + 0.5}
                            C ${lx + 10} ${upperFissureY - 0.5}, ${rx - 10} ${upperFissureY - 0.5}, ${rx - 4} ${cornerY + 0.5}
                            C ${rx - 9} ${upperFissureY + Math.min(3.8, totalOpening * 0.38)}, ${lx + 9} ${upperFissureY + Math.min(3.8, totalOpening * 0.38)}, ${lx + 4} ${cornerY + 0.5} Z`}
                        fill="#fffdf8"
                        opacity={0.96}
                      />
                    )}

                    {/* 3. Subtle tongue arch on vowels and lingual consonants */}
                    {(viseme.tongueOut || viseme.viseme === 'th' || viseme.viseme === 'aa' || totalOpening > 2.5) && (
                      <ellipse
                        cx={153.5}
                        cy={upperFissureY + totalOpening * 0.65}
                        rx={13 + widthNorm * 1.5}
                        ry={Math.max(1.2, totalOpening * 0.30)}
                        fill="url(#naturalTongueGrad)"
                        filter="url(#cavitySoftEdge)"
                        opacity={0.94}
                      />
                    )}

                    {/* 4. Lower teeth enamel arc on wide open vowels */}
                    {totalOpening > 5.5 && (
                      <path
                        d={`M ${lx + 6} ${lowerFissureY - 0.5}
                            C ${lx + 12} ${lowerFissureY - 2.2}, ${rx - 12} ${lowerFissureY - 2.2}, ${rx - 6} ${lowerFissureY - 0.5}
                            C ${rx - 10} ${lowerFissureY + 0.5}, ${lx + 10} ${lowerFissureY + 0.5}, ${lx + 6} ${lowerFissureY - 0.5} Z`}
                        fill="url(#avatarLowerTeethGrad)"
                        filter="url(#cavitySoftEdge)"
                        opacity={0.88}
                      />
                    )}

                    {/* 5. Dynamic Upper Lip Vermillion Articulation */}
                    <path
                      d={`M ${lx} ${cornerY}
                          C ${lx + 7} ${cupidTopY + 1.5}, 148 ${cupidTopY}, 153.5 ${cupidTopY}
                          C 159 ${cupidTopY}, ${rx - 7} ${cupidTopY + 1.5}, ${rx} ${cornerY}
                          C ${rx - 8} ${upperFissureY}, ${lx + 8} ${upperFissureY}, ${lx} ${cornerY} Z`}
                      fill="url(#avatarUpperLipGrad)"
                      filter="url(#cavitySoftEdge)"
                      opacity={0.96}
                    />

                    {/* 6. Dynamic Lower Lip Vermillion Articulation */}
                    <path
                      d={`M ${lx} ${cornerY}
                          C ${lx + 8} ${lowerFissureY}, ${rx - 8} ${lowerFissureY}, ${rx} ${cornerY}
                          C ${rx - 7} ${lowerLipBottomY}, ${lx + 7} ${lowerLipBottomY}, ${lx} ${cornerY} Z`}
                      fill="#d77278"
                      filter="url(#cavitySoftEdge)"
                      opacity={0.98}
                    />
                  </g>
                );
              })()}

              {/* LAYER 4: MOVING PHOTOGRAPHIC LOWER LIP & CHIN */}
              <g
                id="photographicLipMovement"
                mask="url(#teacherPhotographicLowerLipMask)"
                style={{
                  transform: `translate3d(0px, ${jawDisplacementPx}px, 0px) scaleX(${1 + cornerSpreadPx * 0.015})`,
                  transformOrigin: '153.5px 180px',
                }}
              >
                <image
                  href={currentTeacher.avatarImage || './assets/prototype/teacher-portrait.png'}
                  x="0"
                  y="0"
                  width="280"
                  height="350"
                  preserveAspectRatio="xMidYMid slice"
                />
              </g>

              {/* LAYER 5: ANIMATED GESTURING HAND & ARM RIG */}
              {/* Renders natural educator arm & hand based on activeGesture */}
              {armProgress > 0.05 && (
                <g
                  id="educatorGestureArm"
                  opacity={armProgress}
                  style={{
                    transform: `translate3d(${activeGesture === 'point' ? -armProgress * 15 : armProgress * 8}px, ${-armProgress * 18}px, 0px)`,
                    transition: 'transform 0.2s ease-out',
                  }}
                >
                  {/* POINTING GESTURE: Elegant right forearm extending toward classroom display */}
                  {activeGesture === 'point' && (
                    <g id="gesturePoint">
                      {/* Tailored White Blazer Sleeve */}
                      <path
                        d="M 230 350 L 175 270 C 160 250, 140 235, 115 220 L 100 232 C 122 248, 142 268, 155 285 L 195 350 Z"
                        fill="#f8fafc"
                        stroke="#e2e8f0"
                        strokeWidth="1.5"
                      />
                      {/* Navy Inner Blouse Cuff */}
                      <path d="M 115 220 L 100 232 L 96 226 L 110 215 Z" fill="#1e293b" />
                      {/* Realistic Hand with Index Finger Extended Pointing Left */}
                      <path
                        d="M 110 215 C 105 210, 92 200, 78 192 C 72 188, 65 186, 58 184 L 56 189 C 62 192, 70 196, 75 200 L 78 206 C 72 206, 68 209, 68 213 C 68 216, 72 219, 78 219 L 90 226 C 96 230, 102 228, 106 224 Z"
                        fill="#dfa996"
                        stroke="#be8775"
                        strokeWidth="0.8"
                      />
                      {/* Holographic Laser Pointer Guidance Beam toward 3D classroom */}
                      <line
                        x1="56"
                        y1="186"
                        x2="4"
                        y2="175"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                        className="animate-pulse"
                      />
                      <circle cx="4" cy="175" r="5" fill="#0284c7" opacity="0.4" className="animate-ping" />
                      <circle cx="4" cy="175" r="2.5" fill="#38bdf8" />
                    </g>
                  )}

                  {/* OPEN-PALM GESTURE: Welcoming, educational presentation */}
                  {activeGesture === 'open-palm' && (
                    <g id="gestureOpenPalm">
                      {/* Blazer Sleeve */}
                      <path
                        d="M 230 350 L 185 280 C 172 260, 158 248, 138 238 L 126 248 C 145 260, 160 276, 170 295 L 200 350 Z"
                        fill="#f8fafc"
                        stroke="#e2e8f0"
                        strokeWidth="1.5"
                      />
                      {/* Open Palm facing upward-forward */}
                      <path
                        d="M 138 238 C 132 232, 120 220, 105 212 C 98 208, 90 206, 82 206 L 82 212 C 90 213, 98 216, 104 222 C 96 220, 88 220, 80 222 L 80 228 C 88 228, 96 232, 102 236 C 96 236, 88 238, 82 242 L 84 247 C 92 246, 102 244, 110 248 L 126 248 Z"
                        fill="#dfa996"
                        stroke="#be8775"
                        strokeWidth="0.8"
                      />
                    </g>
                  )}

                  {/* THINKING GESTURE: Pensive hand near collar/chin */}
                  {activeGesture === 'think' && (
                    <g id="gestureThink">
                      {/* Forearm bent upward near chest */}
                      <path
                        d="M 235 350 L 195 285 C 185 268, 175 255, 165 242 L 155 248 C 165 262, 175 278, 185 295 L 210 350 Z"
                        fill="#f8fafc"
                        stroke="#e2e8f0"
                        strokeWidth="1.5"
                      />
                      {/* Relaxed hand touching collar/chin */}
                      <path
                        d="M 165 242 C 160 236, 155 228, 152 222 C 150 218, 152 215, 156 215 C 160 215, 164 220, 166 226 L 168 232 C 172 234, 176 238, 174 242 Z"
                        fill="#dfa996"
                        stroke="#be8775"
                        strokeWidth="0.8"
                      />
                    </g>
                  )}
                </g>
              )}
            </svg>

            {/* Vignette & Soft Rim Lighting */}
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
          </div>
        </div>

        {/* Real-time Voice Audio Visualizer Waveform Bar */}
        {(state === 'speaking' || state === 'explaining' || isSpeaking) && (
          <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-center gap-1 py-1.5 px-3 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/80">
            {[4, 8, 14, 20, 26, 18, 12, 6, 16, 24, 15, 8].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-blue-500 to-indigo-400 rounded-full transition-all duration-75"
                style={{
                  height: `${Math.max(4, h * (smoothJaw + 0.25) * (1 + Math.sin(Date.now() * 0.01 + i) * 0.25))}px`,
                }}
              />
            ))}
            <span className="text-[11px] font-medium text-slate-300 ml-2">Photographic Sync (60 FPS)</span>
          </div>
        )}
      </div>

      {/* Interactive Gesture Trigger Dock (User Request: specific animations when explaining or answering) */}
      <div className="px-3 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs z-20">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <Hand className="w-3.5 h-3.5 text-cyan-400" />
          Gesture Controls:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={handleDemonstrateSpeech}
            title="Play educator voice with synchronized 60 FPS lip articulation"
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Volume2 className="w-3 h-3 animate-pulse" />
            Speak & Lip Sync
          </button>
          <button
            onClick={() => triggerManualGesture('point')}
            title="Point to active 3D label"
            className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
              activeGesture === 'point'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            👉 Point
          </button>
          <button
            onClick={() => triggerManualGesture('nod')}
            title="Affirmative nod when answering questions"
            className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
              activeGesture === 'nod'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            🤝 Nod
          </button>
          <button
            onClick={() => triggerManualGesture('open-palm')}
            title="Open-palm concept explanation"
            className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
              activeGesture === 'open-palm'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            👋 Explain
          </button>
          <button
            onClick={() => triggerManualGesture('think')}
            title="Ponder student question"
            className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
              activeGesture === 'think'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            🤔 Ponder
          </button>
          <button
            onClick={() => triggerManualGesture('rest')}
            title="Resting posture"
            className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
              activeGesture === 'rest'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Rest
          </button>
        </div>
      </div>

      {/* Educator Details & Teacher Selector Footer */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2 z-20">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            Switch Educator:
          </span>

          <div className="flex items-center gap-1">
            {availableTeachers.map((t) => (
              <button
                key={t.id}
                onClick={() => onSwitchTeacher(t)}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                  t.id === currentTeacher.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {t.name.split(' ')[0]} {t.gender === 'female' ? '♀' : '♂'}
              </button>
            ))}
          </div>
        </div>

        {/* Architecture Adapter info */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-emerald-400" />
            Photographic Neural Mesh (60 FPS)
          </span>
          <span className="text-slate-400">Gemini TTS ({currentTeacher.voiceName})</span>
        </div>
      </div>
    </div>
  );
};
