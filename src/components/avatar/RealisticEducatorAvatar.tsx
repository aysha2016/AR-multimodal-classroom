import React, { useEffect, useRef, useState } from 'react';
import { TeacherAvatarConfig, TeacherState, VisemeFrame } from '../../types';
import { avatarAudioEngine, AvatarGestureType, AvatarGestureEvent } from '../../services/avatarAudioEngine';
import { Volume2, VolumeX, Compass, Hand, Check, HelpCircle } from 'lucide-react';

export type AvatarGesture = 'rest' | 'open-palm' | 'point' | 'nod' | 'think';

interface RealisticEducatorAvatarProps {
  currentTeacher: TeacherAvatarConfig;
  highlightedElement?: string;
  isSpeaking?: boolean;
  speechText?: string;
  className?: string;
  compact?: boolean;
  onToggleMute?: () => void;
  isMuted?: boolean;
}

export const RealisticEducatorAvatar: React.FC<RealisticEducatorAvatarProps> = ({
  currentTeacher,
  highlightedElement,
  isSpeaking: propIsSpeaking,
  speechText,
  className = '',
  compact = false,
  onToggleMute,
  isMuted = false,
}) => {
  const [teacherState, setTeacherState] = useState<TeacherState>('idle');
  const [viseme, setViseme] = useState<VisemeFrame>({
    viseme: 'sil',
    jawDrop: 0,
    mouthWidth: 0,
    lipRound: 0,
    teethVisible: false,
    tongueOut: false,
  });

  // Kinematic state
  const [breathPhase, setBreathPhase] = useState<number>(0);
  const [blinkProgress, setBlinkProgress] = useState<number>(0);
  const [headTilt, setHeadTilt] = useState<{ x: number; y: number; roll: number }>({ x: 0, y: 0, roll: 0 });
  const [gazeOffset, setGazeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [gesture, setGesture] = useState<AvatarGesture>('rest');
  const [activeTargetLabel, setActiveTargetLabel] = useState<string | undefined>(highlightedElement);
  const [armProgress, setArmProgress] = useState<number>(0);

  // Sub-frame smoothed kinematic registers for ultra-natural photographic lip sync
  const [smoothJaw, setSmoothJaw] = useState<number>(0);
  const [smoothWidth, setSmoothWidth] = useState<number>(0);
  const [smoothRound, setSmoothRound] = useState<number>(0);

  const smoothJawRef = useRef<number>(0);
  const smoothWidthRef = useRef<number>(0);
  const smoothRoundRef = useRef<number>(0);
  const targetArmRef = useRef<number>(0);
  const currentArmRef = useRef<number>(0);

  const blinkStateRef = useRef<'open' | 'closing' | 'opening'>('open');
  const lastBlinkTimeRef = useRef<number>(Date.now());
  const animFrameRef = useRef<number | null>(null);
  const nodTimerRef = useRef<number>(0);
  const isNoddingRef = useRef<boolean>(false);

  // Sync prop changes
  useEffect(() => {
    if (highlightedElement) {
      setActiveTargetLabel(highlightedElement);
      avatarAudioEngine.triggerGesture('point', highlightedElement, 4500, 'label');
    }
  }, [highlightedElement]);

  // Subscribe to viseme, state, and gesture events from avatarAudioEngine
  useEffect(() => {
    const unsubViseme = avatarAudioEngine.subscribeVisemes((v) => {
      setViseme(v);
    });

    const unsubState = avatarAudioEngine.subscribeState((s) => {
      setTeacherState(s);
      if (s === 'thinking') {
        setGesture('think');
      }
    });

    const unsubGesture = avatarAudioEngine.subscribeGesture((event: AvatarGestureEvent) => {
      setGesture(event.gesture);
      if (event.targetLabel) {
        setActiveTargetLabel(event.targetLabel);
      }
      if (event.gesture === 'nod') {
        isNoddingRef.current = true;
        nodTimerRef.current = 0;
      }
    });

    return () => {
      unsubViseme();
      unsubState();
      unsubGesture();
    };
  }, []);

  const isSpeaking = propIsSpeaking || teacherState === 'speaking' || teacherState === 'explaining' || viseme.viseme !== 'sil';

  // Main 60 FPS continuous kinematic loop: respiration, blink, saccades, micro-head gestures, sub-frame lip easing, gestures
  useEffect(() => {
    let startTime = performance.now();

    const loop = (timestamp: number) => {
      const elapsed = (timestamp - startTime) / 1000;

      // 1. Respiration kinematics (14 bpm)
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

      // 3. Affirmative Nodding Dynamics
      let nodOffsetY = 0;
      if (isNoddingRef.current) {
        nodTimerRef.current += 0.055;
        const t = nodTimerRef.current;
        const nodWave = Math.sin(t * 7.5) * Math.exp(-t * 0.9);
        nodOffsetY = nodWave * 3.8;
        if (t > 2.8) {
          isNoddingRef.current = false;
          nodTimerRef.current = 0;
        }
      }

      // 4. Head & Gaze micro-movements
      if (gesture === 'point') {
        setHeadTilt({ x: -3.8, y: nodOffsetY + 0.8, roll: -1.2 });
        setGazeOffset({ x: -4.5, y: 0.6 });
      } else if (gesture === 'think') {
        setHeadTilt({ x: 3.5, y: -2.2 + nodOffsetY, roll: 2.2 });
        setGazeOffset({ x: 3.2, y: -2.8 });
      } else if (gesture === 'nod') {
        setHeadTilt({ x: 0, y: nodOffsetY, roll: 0 });
        setGazeOffset({ x: 0, y: 0 });
      } else if (isSpeaking) {
        const nod = Math.sin(elapsed * 3.0) * 1.2 + nodOffsetY;
        const tilt = Math.cos(elapsed * 2.0) * 1.0;
        const roll = Math.sin(elapsed * 1.4) * 0.7;
        setHeadTilt({ x: tilt, y: nod, roll });
        setGazeOffset({ x: Math.sin(elapsed * 0.8) * 1.2, y: Math.cos(elapsed * 0.5) * 0.8 });
      } else {
        const idleX = Math.sin(elapsed * 0.5) * 0.4;
        const idleY = breath * 0.6 + nodOffsetY;
        setHeadTilt({ x: idleX, y: idleY, roll: idleX * 0.2 });
        setGazeOffset({ x: Math.sin(elapsed * 0.3) * 0.3, y: 0 });
      }

      // 5. Arm & Hand Gesture Spring Kinematics
      targetArmRef.current = gesture === 'point' || gesture === 'open-palm' || gesture === 'think' ? 1.0 : 0.0;
      currentArmRef.current += (targetArmRef.current - currentArmRef.current) * 0.12;
      setArmProgress(currentArmRef.current);

      // 6. Sub-frame continuous photographic lip sync smoothing
      let targetJaw = viseme.jawDrop;
      let targetWidth = viseme.mouthWidth;
      let targetRound = viseme.lipRound;

      if (isSpeaking && viseme.viseme === 'sil') {
        const speechSpeed = 13.5;
        const wave1 = Math.sin(elapsed * speechSpeed);
        const wave2 = Math.sin(elapsed * 6.5);
        const wave3 = Math.cos(elapsed * 21.0);
        const syllableGate = Math.sin(elapsed * 2.8);
        if (syllableGate > -0.35) {
          const raw = Math.max(0, wave1 * 0.58 + wave2 * 0.32 + wave3 * 0.1);
          targetJaw = Math.pow(raw, 1.15) * 0.85;
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

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [gesture, isSpeaking, viseme]);

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

  // Eye Coordinates in 280 x 350
  const leftEyeX = 132;
  const leftEyeY = 112;
  const rightEyeX = 192;
  const rightEyeY = 118;

  return (
    <div className={`relative select-none pointer-events-auto ${className}`}>
      {/* Outer Glow & Card Frame */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-950/40 backdrop-blur-md">
        {/* Subtle breathing and head-tilt motion */}
        <div
          className="relative w-full h-full overflow-hidden transition-transform duration-75 ease-out"
          style={{
            transform: `translate3d(${headTilt.x * 0.35}px, ${headTilt.y * 0.35 + breathPhase * 2.5}px, 0px) rotate(${headTilt.roll * 0.3}deg)`,
          }}
        >
          {/* Base SVG with Teacher Portrait, Photographic Lip Deformation & Arm Rig */}
          <svg
            viewBox="0 0 280 350"
            className="w-full h-full object-cover object-top select-none pointer-events-none"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* 1. Feathered mask isolating her authentic lower lip and chin from the photograph */}
              <mask id="teacherPhotoLowerLipMaskMain">
                <rect x="0" y="0" width="280" height="350" fill="black" />
                <path
                  d="M 125 178 Q 153.5 180 182 178.5 C 183 194 172 216 153.5 220 C 135 216 124 194 125 178 Z"
                  fill="white"
                  filter="url(#lipMaskFeatherMain)"
                />
              </mask>

              <filter id="lipMaskFeatherMain" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="1.0" />
              </filter>

              {/* 2. Realistic Oral Cavity Depth Gradient */}
              <linearGradient id="oralDepthGradMain" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#140305" />
                <stop offset="60%" stopColor="#24070b" />
                <stop offset="100%" stopColor="#380e13" />
              </linearGradient>

              {/* 3. Soft tongue cushion gradient */}
              <linearGradient id="naturalTongueGradMain" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#b44b58" />
                <stop offset="100%" stopColor="#7e2732" />
              </linearGradient>

              {/* 4. Natural Eyelid Skin Gradient */}
              <linearGradient id="eyelidSkinGradMain" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d3a793" />
                <stop offset="100%" stopColor="#b98873" />
              </linearGradient>

              {/* 5. Upper lip vermillion gradient */}
              <linearGradient id="upperLipGradMain" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#bf5259" />
                <stop offset="45%" stopColor="#d56d74" />
                <stop offset="100%" stopColor="#96373e" />
              </linearGradient>

              {/* 6. Lower teeth enamel gradient */}
              <linearGradient id="lowerTeethGradMain" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#f5f0e6" />
                <stop offset="100%" stopColor="#c5b6a7" />
              </linearGradient>

              <filter id="softSkinBlendMain" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.9" />
              </filter>
              <filter id="cavitySoftEdgeMain" x="-10%" y="-10%" width="120%" height="120%">
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
            <g id="teacherEyesRigMain">
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
                  fill="url(#eyelidSkinGradMain)"
                  filter="url(#softSkinBlendMain)"
                  opacity="0.98"
                />
              )}

              {/* Right Eye Progressive Eyelid Blink */}
              {blinkProgress > 0.05 && (
                <path
                  d={`M 176 118 Q 192 ${118 + blinkProgress * 7.5} 208 118 Q 192 ${118 - (1 - blinkProgress) * 2.5} 176 118 Z`}
                  fill="url(#eyelidSkinGradMain)"
                  filter="url(#softSkinBlendMain)"
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
                <g id="oralApertureMain" opacity={Math.min(1, smoothJaw * 4.5)}>
                  {/* 1. Deep oral cavity aperture (spanning full mouth width) */}
                  <path
                    d={`M ${lx} ${cornerY}
                        C ${lx + 8} ${upperFissureY - 0.5}, ${rx - 8} ${upperFissureY - 0.5}, ${rx} ${cornerY}
                        C ${rx - 7} ${lowerFissureY + 0.5}, ${lx + 7} ${lowerFissureY + 0.5}, ${lx} ${cornerY} Z`}
                    fill="url(#oralDepthGradMain)"
                    filter="url(#cavitySoftEdgeMain)"
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
                      fill="url(#naturalTongueGradMain)"
                      filter="url(#cavitySoftEdgeMain)"
                      opacity={0.94}
                    />
                  )}

                  {/* 4. Lower teeth enamel arc on wide open vowels */}
                  {totalOpening > 5.5 && (
                    <path
                      d={`M ${lx + 6} ${lowerFissureY - 0.5}
                          C ${lx + 12} ${lowerFissureY - 2.2}, ${rx - 12} ${lowerFissureY - 2.2}, ${rx - 6} ${lowerFissureY - 0.5}
                          C ${rx - 10} ${lowerFissureY + 0.5}, ${lx + 10} ${lowerFissureY + 0.5}, ${lx + 6} ${lowerFissureY - 0.5} Z`}
                      fill="url(#lowerTeethGradMain)"
                      filter="url(#cavitySoftEdgeMain)"
                      opacity={0.88}
                    />
                  )}

                  {/* 5. Dynamic Upper Lip Vermillion Articulation */}
                  <path
                    d={`M ${lx} ${cornerY}
                        C ${lx + 7} ${cupidTopY + 1.5}, 148 ${cupidTopY}, 153.5 ${cupidTopY}
                        C 159 ${cupidTopY}, ${rx - 7} ${cupidTopY + 1.5}, ${rx} ${cornerY}
                        C ${rx - 8} ${upperFissureY}, ${lx + 8} ${upperFissureY}, ${lx} ${cornerY} Z`}
                    fill="url(#upperLipGradMain)"
                    filter="url(#cavitySoftEdgeMain)"
                    opacity={0.96}
                  />

                  {/* 6. Dynamic Lower Lip Vermillion Articulation */}
                  <path
                    d={`M ${lx} ${cornerY}
                        C ${lx + 8} ${lowerFissureY}, ${rx - 8} ${lowerFissureY}, ${rx} ${cornerY}
                        C ${rx - 7} ${lowerLipBottomY}, ${lx + 7} ${lowerLipBottomY}, ${lx} ${cornerY} Z`}
                    fill="#d77278"
                    filter="url(#cavitySoftEdgeMain)"
                    opacity={0.98}
                  />
                </g>
              );
            })()}

            {/* LAYER 4: MOVING PHOTOGRAPHIC LOWER LIP & CHIN (100% Real Photo Pixels — Zero Vector Flaws!) */}
            <g
              id="photographicLipMovementMain"
              mask="url(#teacherPhotoLowerLipMaskMain)"
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
            {armProgress > 0.05 && (
              <g
                id="educatorGestureArmMain"
                opacity={armProgress}
                style={{
                  transform: `translate3d(${gesture === 'point' ? -armProgress * 15 : armProgress * 8}px, ${-armProgress * 18}px, 0px)`,
                  transition: 'transform 0.2s ease-out',
                }}
              >
                {/* POINTING GESTURE */}
                {gesture === 'point' && (
                  <g id="gesturePointMain">
                    <path
                      d="M 230 350 L 175 270 C 160 250, 140 235, 115 220 L 100 232 C 122 248, 142 268, 155 285 L 195 350 Z"
                      fill="#f8fafc"
                      stroke="#e2e8f0"
                      strokeWidth="1.5"
                    />
                    <path d="M 115 220 L 100 232 L 96 226 L 110 215 Z" fill="#1e293b" />
                    <path
                      d="M 110 215 C 105 210, 92 200, 78 192 C 72 188, 65 186, 58 184 L 56 189 C 62 192, 70 196, 75 200 L 78 206 C 72 206, 68 209, 68 213 C 68 216, 72 219, 78 219 L 90 226 C 96 230, 102 228, 106 224 Z"
                      fill="#dfa996"
                      stroke="#be8775"
                      strokeWidth="0.8"
                    />
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

                {/* OPEN-PALM GESTURE */}
                {gesture === 'open-palm' && (
                  <g id="gestureOpenPalmMain">
                    <path
                      d="M 230 350 L 185 280 C 172 260, 158 248, 138 238 L 126 248 C 145 260, 160 276, 170 295 L 200 350 Z"
                      fill="#f8fafc"
                      stroke="#e2e8f0"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M 138 238 C 132 232, 120 220, 105 212 C 98 208, 90 206, 82 206 L 82 212 C 90 213, 98 216, 104 222 C 96 220, 88 220, 80 222 L 80 228 C 88 228, 96 232, 102 236 C 96 236, 88 238, 82 242 L 84 247 C 92 246, 102 244, 110 248 L 126 248 Z"
                      fill="#dfa996"
                      stroke="#be8775"
                      strokeWidth="0.8"
                    />
                  </g>
                )}

                {/* THINKING GESTURE */}
                {gesture === 'think' && (
                  <g id="gestureThinkMain">
                    <path
                      d="M 235 350 L 195 285 C 185 268, 175 255, 165 242 L 155 248 C 165 262, 175 278, 185 295 L 210 350 Z"
                      fill="#f8fafc"
                      stroke="#e2e8f0"
                      strokeWidth="1.5"
                    />
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
        </div>

        {/* Live Audio & Speaking Status Badge */}
        <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md border border-white/10 text-white shadow-lg">
          <span
            className={`w-2 h-2 rounded-full ${
              isSpeaking ? 'bg-blue-400 animate-pulse ring-2 ring-blue-500/40' : 'bg-emerald-400'
            }`}
          />
          <span className="text-[11px] font-bold tracking-tight">{currentTeacher.name}</span>
          {gesture !== 'rest' && (
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 font-mono font-semibold ml-0.5 border border-cyan-800/60">
              {gesture === 'point' ? '👉 POINTING' : gesture === 'nod' ? '🤝 NODDING' : gesture === 'think' ? '🤔 PONDERING' : '👋 EXPLAINING'}
            </span>
          )}
        </div>

        {/* Audio Mute & Replay Toggle */}
        {onToggleMute && (
          <button
            onClick={onToggleMute}
            className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 shadow-lg transition-transform hover:scale-105 active:scale-95"
            title={isMuted ? 'Unmute Teacher' : 'Mute Teacher'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-blue-400" />}
          </button>
        )}

        {/* Target Indicator when Teacher is Pointing toward a Component */}
        {gesture === 'point' && (activeTargetLabel || highlightedElement) && (
          <div className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-600/90 text-white text-[11px] font-semibold shadow-lg border border-blue-400/50 animate-pulse">
            <Compass className="w-3 h-3 text-cyan-200" />
            <span>Explaining: {activeTargetLabel || highlightedElement}</span>
          </div>
        )}
      </div>
    </div>
  );
};
