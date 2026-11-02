import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Lesson, InteractiveLabel, TeacherAvatarConfig, VisemeFrame } from '../../types';
import { avatarAudioEngine } from '../../services/avatarAudioEngine';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  FastForward,
  Rewind,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  CheckCircle,
  Sliders,
  Box,
  Eye,
  EyeOff,
  Compass,
} from 'lucide-react';

interface AnimatedVideoSceneProps {
  lesson: Lesson;
  activeLabel: InteractiveLabel | null;
  onSelectLabel: (label: InteractiveLabel) => void;
  currentTeacher: TeacherAvatarConfig;
  isPlayingNarration: boolean;
  onToggleNarration: () => void;
  onSwitchTo3D: () => void;
  onSwitchToDiagram?: () => void;
  onSwitchToAR?: () => void;
  speechText: string;
  onSetSpeechText: (text: string) => void;
}

interface VideoChapter {
  id: string;
  time: number;
  label: string;
  stageName: string;
  description: string;
}

const LESSON_CHAPTERS: Record<string, VideoChapter[]> = {
  'water-cycle': [
    {
      id: 'overview',
      time: 0,
      label: 'Overview',
      stageName: 'Hydrological Cycle',
      description: 'The Earth hydrological cycle is a continuous system powered by solar thermal radiation.',
    },
    {
      id: 'evaporation',
      time: 18,
      label: 'Evaporation',
      stageName: 'Solar Evaporation',
      description: 'Solar radiation transfers kinetic thermal energy into surface water, causing it to evaporate as water vapour.',
    },
    {
      id: 'condensation',
      time: 40,
      label: 'Condensation',
      stageName: 'Cloud Formation',
      description: 'As warm, humid air rises and cools to its dew point, water vapor condenses into clouds around microscopic aerosols.',
    },
    {
      id: 'precipitation',
      time: 62,
      label: 'Precipitation',
      stageName: 'Atmospheric Rain',
      description: 'Condensed droplets grow until gravity overcomes updrafts, falling back to Earth as rain and snow.',
    },
    {
      id: 'collection',
      time: 80,
      label: 'Collection',
      stageName: 'Reservoirs & Runoff',
      description: 'Precipitated water collects in rivers, lakes, oceans, and replenishes underground aquifers.',
    },
  ],
  'human-heart': [
    {
      id: 'overview',
      time: 0,
      label: 'Overview',
      stageName: 'Cardiovascular Dynamics',
      description: 'The human heart acts as a dual-action muscular pump circulating oxygenated and deoxygenated blood.',
    },
    {
      id: 'atria',
      time: 20,
      label: 'Right Atrium',
      stageName: 'Venous Return',
      description: 'Deoxygenated blood enters the right atrium via the superior and inferior vena cava.',
    },
    {
      id: 'ventricles',
      time: 45,
      label: 'Ventricular Systole',
      stageName: 'Systolic Contraction',
      description: 'The strong muscular left ventricle contracts, pumping blood under high pressure through the aorta.',
    },
    {
      id: 'circulation',
      time: 70,
      label: 'Pulmonary Loop',
      stageName: 'Oxygenation',
      description: 'Blood flows through pulmonary arteries into the lungs for gas exchange, picking up fresh oxygen.',
    },
  ],
  'solar-system': [
    {
      id: 'overview',
      time: 0,
      label: 'Overview',
      stageName: 'Heliosphere',
      description: 'Our solar system consists of the central Sun and eight gravitationally bound planets in elliptical orbits.',
    },
    {
      id: 'inner',
      time: 25,
      label: 'Terrestrial Planets',
      stageName: 'Rocky Planets',
      description: 'Mercury, Venus, Earth, and Mars orbit closest to the Sun with solid silicates and metallic cores.',
    },
    {
      id: 'gas-giants',
      time: 55,
      label: 'Gas Giants',
      stageName: 'Jovian Planets',
      description: 'Jupiter and Saturn contain massive hydrogen and helium atmospheres with extensive ring and moon systems.',
    },
  ],
  'plant-cell': [
    {
      id: 'overview',
      time: 0,
      label: 'Overview',
      stageName: 'Eukaryotic Cell',
      description: 'Plant cells have specialized rigid cell walls, chloroplasts for photosynthesis, and a large central vacuole.',
    },
    {
      id: 'chloroplast',
      time: 30,
      label: 'Chloroplasts',
      stageName: 'Photosynthesis',
      description: 'Chloroplasts contain chlorophyll pigments that capture sunlight to convert CO₂ and water into glucose and oxygen.',
    },
    {
      id: 'nucleus',
      time: 60,
      label: 'Nucleus',
      stageName: 'Genetic Control',
      description: 'The nucleus houses chromatin and genomic DNA, regulating cellular protein synthesis and division.',
    },
  ],
  volcano: [
    {
      id: 'overview',
      time: 0,
      label: 'Overview',
      stageName: 'Magmatic Activity',
      description: 'Volcanoes are geological vents where molten rock, volcanic gases, and pyroclastic debris erupt to the surface.',
    },
    {
      id: 'chamber',
      time: 30,
      label: 'Magma Chamber',
      stageName: 'Subsurface Reservoir',
      description: 'Buoyant liquid magma accumulates beneath the crust under immense lithostatic pressure.',
    },
    {
      id: 'eruption',
      time: 60,
      label: 'Explosive Eruption',
      stageName: 'Plinian Column',
      description: 'Gas expansion propels magma through the central vent, generating lava flows and ash plumes.',
    },
  ],
  'electric-circuit': [
    {
      id: 'overview',
      time: 0,
      label: 'Overview',
      stageName: 'Closed Circuit',
      description: 'An electric circuit is a closed loop of conductive material allowing continuous flow of electric charge.',
    },
    {
      id: 'power',
      time: 30,
      label: 'Electromotive Force',
      stageName: 'Battery Source',
      description: 'Chemical reactions in the battery produce a potential difference (voltage) driving electron flow.',
    },
    {
      id: 'load',
      time: 60,
      label: 'Incandescent Load',
      stageName: 'Filament Radiance',
      description: 'Electrons collide with tungsten atoms in the filament, generating intense heat and visible photon emissions.',
    },
  ],
};

const LESSON_ARTWORK: Record<string, string> = {
  'water-cycle': '/assets/prototype/classroom-hero.png?v=clean2',
  'human-heart': '/assets/prototype/thumb-human-heart.png',
  'solar-system': '/assets/prototype/thumb-solar-system.png',
  'plant-cell': '/assets/prototype/thumb-plant-cell.png',
  volcano: '/assets/prototype/thumb-volcano.png',
  'electric-circuit': '/assets/prototype/thumb-electric-circuit.png',
};

export const AnimatedVideoScene: React.FC<AnimatedVideoSceneProps> = ({
  lesson,
  activeLabel,
  onSelectLabel,
  currentTeacher,
  isPlayingNarration,
  onToggleNarration,
  onSwitchTo3D,
  onSwitchToDiagram,
  onSwitchToAR,
  speechText,
  onSetSpeechText,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const duration = 90; // 90 seconds total lesson animation length
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [activeChapterId, setActiveChapterId] = useState<string>('overview');

  // Label visibility control: default to FALSE (clean, uncluttered view without labels)
  const [showHotspotLabels, setShowHotspotLabels] = useState<boolean>(false);

  // Avatar teacher micro-kinematics & realistic viseme articulation
  const [breathPhase, setBreathPhase] = useState<number>(0);
  const [blinkProgress, setBlinkProgress] = useState<number>(0);
  const [isTeacherSpeaking, setIsTeacherSpeaking] = useState<boolean>(false);
  const [viseme, setViseme] = useState<VisemeFrame>({
    viseme: 'sil',
    jawDrop: 0,
    mouthWidth: 0,
    lipRound: 0,
    teethVisible: false,
    tongueOut: false,
  });

  const [smoothJaw, setSmoothJaw] = useState<number>(0);
  const [smoothWidth, setSmoothWidth] = useState<number>(0);
  const [smoothRound, setSmoothRound] = useState<number>(0);

  const smoothJawRef = useRef<number>(0);
  const smoothWidthRef = useRef<number>(0);
  const smoothRoundRef = useRef<number>(0);
  const blinkStateRef = useRef<'open' | 'closing' | 'opening'>('open');
  const lastBlinkTimeRef = useRef<number>(Date.now());

  const isPlayingRef = useRef<boolean>(isPlaying);
  const isPlayingNarrationRef = useRef<boolean>(isPlayingNarration);
  const visemeRef = useRef<VisemeFrame>(viseme);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isPlayingNarrationRef.current = isPlayingNarration;
  }, [isPlayingNarration]);

  useEffect(() => {
    visemeRef.current = viseme;
  }, [viseme]);

  // Subscribe to viseme engine events once
  const [isAudioUnlocked, setIsAudioUnlocked] = useState<boolean>(avatarAudioEngine.getAudioUnlocked());

  useEffect(() => {
    const unsubUnlock = avatarAudioEngine.subscribeAudioUnlock((unlocked) => {
      setIsAudioUnlocked(unlocked);
    });
    return unsubUnlock;
  }, []);

  useEffect(() => {
    const unsubViseme = avatarAudioEngine.subscribeVisemes((v) => {
      setViseme(v);
      visemeRef.current = v;
      setIsTeacherSpeaking(v.viseme !== 'sil');
    });

    return () => {
      unsubViseme();
    };
  }, []);

  // 60 FPS continuous sub-frame kinematic loop: breathing, blinking, and realistic lip articulation
  useEffect(() => {
    let animId: number;
    let startTime = performance.now();

    const loop = (t: number) => {
      const elapsed = (t - startTime) / 1000;
      setBreathPhase(Math.sin(elapsed * 1.5) * 0.5 + 0.5);

      // Organic spontaneous blinking (~every 3.6s with natural variance)
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

      // Continuous 60 FPS sub-frame smoothed lip sync articulation
      let targetJaw = visemeRef.current.jawDrop;
      let targetWidth = visemeRef.current.mouthWidth;
      let targetRound = visemeRef.current.lipRound;

      const isSpeakingAudio = visemeRef.current.viseme !== 'sil';
      if (isSpeakingAudio) {
        // Direct audio viseme response with full clear amplitude
        targetJaw = visemeRef.current.jawDrop;
        targetWidth = visemeRef.current.mouthWidth;
        targetRound = visemeRef.current.lipRound;
      } else if (isPlayingRef.current && isPlayingNarrationRef.current) {
        // Human conversational speech cadence model:
        // Operates in natural speech phrases (~3.6s) with word bursts, variable syllable timing,
        // distinct vowel openings, and natural breath/clause pauses
        const phraseCycle = elapsed % 3.6; // 3.6s breath/clause cycle
        if (phraseCycle < 2.9) {
          const syllableClock = elapsed * 3.4; // ~3.4 syllables per second
          const syllableIndex = Math.floor(syllableClock);
          const syllableFrac = syllableClock - syllableIndex; // 0.0 to 1.0 within syllable

          // Deterministic pseudo-phonetic progression per syllable
          const seed = Math.sin(syllableIndex * 12.9898) * 43758.5453;
          const phonemeKind = Math.abs(seed) % 1.0;

          // Asymmetric muscle envelope: rapid attack (opening), sustained vowel hold, cushioned closure
          let envelope = 0;
          if (syllableFrac < 0.20) {
            envelope = Math.sin((syllableFrac / 0.20) * (Math.PI / 2));
          } else if (syllableFrac < 0.75) {
            envelope = 1.0 - 0.15 * ((syllableFrac - 0.20) / 0.55);
          } else {
            envelope = 0.85 * Math.cos(((syllableFrac - 0.75) / 0.25) * (Math.PI / 2));
          }

          if (phonemeKind < 0.38) {
            // Open vowel (AA, AH) - e.g. "water", "cycle", "cloud"
            targetJaw = envelope * 0.98;
            targetWidth = 0.18;
            targetRound = 0.08;
          } else if (phonemeKind < 0.65) {
            // Front spread vowel (EE, IH) - e.g. "heat", "evaporate", "energy"
            targetJaw = envelope * 0.58;
            targetWidth = envelope * 0.68;
            targetRound = 0.0;
          } else if (phonemeKind < 0.85) {
            // Rounded back vowel (OH, OO) - e.g. "ocean", "atmosphere", "cool"
            targetJaw = envelope * 0.76;
            targetWidth = -envelope * 0.45;
            targetRound = envelope * 0.75;
          } else {
            // Consonant closure / transition (M, B, P, S, T)
            targetJaw = envelope * 0.08;
            targetWidth = 0.06;
            targetRound = 0.02;
          }
        } else {
          // Natural phrase pause between clauses
          targetJaw = 0.0;
          targetWidth = 0.0;
          targetRound = 0.0;
        }
      } else {
        targetJaw = 0.0;
        targetWidth = 0.0;
        targetRound = 0.0;
      }

      // Fast responsive muscle attack, cushioned elastic release
      const jawRate = targetJaw > smoothJawRef.current ? 0.36 : 0.24;
      smoothJawRef.current += (targetJaw - smoothJawRef.current) * jawRate;
      smoothWidthRef.current += (targetWidth - smoothWidthRef.current) * 0.28;
      smoothRoundRef.current += (targetRound - smoothRoundRef.current) * 0.28;

      setSmoothJaw(smoothJawRef.current);
      setSmoothWidth(smoothWidthRef.current);
      setSmoothRound(smoothRoundRef.current);

      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  const chapters = LESSON_CHAPTERS[lesson.id] || LESSON_CHAPTERS['water-cycle'];

  // Pre-fetch and cache lesson chapter audio in background so speech plays with 0ms latency
  useEffect(() => {
    const chapterTexts = chapters.map((ch) => ch.description);
    avatarAudioEngine.preloadLessonAudio(chapterTexts, currentTeacher.voiceName);
  }, [chapters, currentTeacher.voiceName]);

  // Trigger initial chapter speech on start or when switching lesson models
  useEffect(() => {
    const firstCh = chapters[0];
    if (firstCh && isPlayingNarration) {
      avatarAudioEngine.speak(firstCh.description, currentTeacher.voiceName);
    }
  }, [lesson.id, chapters, currentTeacher.voiceName, isPlayingNarration]);

  // Handle stage chapter navigation
  const seekToChapter = useCallback(
    (chapter: VideoChapter) => {
      setCurrentTime(chapter.time);
      setActiveChapterId(chapter.id);
      onSetSpeechText(`${chapter.label}: ${chapter.description}`);
      avatarAudioEngine.triggerGesture('point', chapter.label, 4500, 'label');
      avatarAudioEngine.unlockAudio();
      if (isPlayingNarration) {
        avatarAudioEngine.speak(chapter.description, currentTeacher.voiceName);
      }
      // If matching label exists, select it
      const matchingLabel = lesson.labels.find(
        (lbl) => lbl.id.toLowerCase().includes(chapter.id) || chapter.id.includes(lbl.id.toLowerCase())
      );
      if (matchingLabel) {
        onSelectLabel(matchingLabel);
      }
    },
    [lesson.labels, isPlayingNarration, currentTeacher.voiceName, onSetSpeechText, onSelectLabel]
  );

  // Timeline playback timer loop
  useEffect(() => {
    let timer: number;
    if (isPlaying) {
      timer = window.setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.25 * playbackSpeed;
          if (next >= duration) {
            return 0; // Loop seamlessly
          }
          return next;
        });
      }, 250);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, duration]);

  // Sync active chapter with currentTime and trigger synchronized speech
  useEffect(() => {
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (currentTime >= chapters[i].time) {
        if (activeChapterId !== chapters[i].id) {
          const ch = chapters[i];
          setActiveChapterId(ch.id);
          onSetSpeechText(`${ch.label}: ${ch.description}`);
          avatarAudioEngine.triggerGesture('point', ch.label, 4000, 'label');
          if (isPlayingNarration && isPlaying) {
            avatarAudioEngine.speak(ch.description, currentTeacher.voiceName);
          }
        }
        break;
      }
    }
  }, [currentTime, chapters, activeChapterId, isPlayingNarration, isPlaying, currentTeacher.voiceName, onSetSpeechText]);

  // High-performance canvas particle & lighting animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pools
    const vaporParticles: { x: number; y: number; speedY: number; speedX: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 45; i++) {
      vaporParticles.push({
        x: 0.65 * width + Math.random() * (0.22 * width),
        y: 0.55 * height + Math.random() * (0.35 * height),
        speedY: 0.6 + Math.random() * 1.2,
        speedX: (Math.random() - 0.5) * 0.4,
        size: 2.5 + Math.random() * 4.5,
        alpha: 0.2 + Math.random() * 0.6,
      });
    }

    const rainParticles: { x: number; y: number; speedY: number; length: number; alpha: number }[] = [];
    for (let i = 0; i < 60; i++) {
      rainParticles.push({
        x: 0.42 * width + Math.random() * (0.28 * width),
        y: 0.22 * height + Math.random() * (0.45 * height),
        speedY: 4.5 + Math.random() * 3.5,
        length: 8 + Math.random() * 12,
        alpha: 0.3 + Math.random() * 0.5,
      });
    }

    // Solar flare ray pulses
    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      if (lesson.id === 'water-cycle') {
        // 1. Radiant Solar Flare & Shimmer over Sun (top right ~82% width, 24% height)
        const sunX = width * 0.83;
        const sunY = height * 0.26;
        const sunPulse = Math.sin(frame * 0.04) * 8 + 42;

        const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, sunPulse + 50);
        sunGrad.addColorStop(0, 'rgba(255, 235, 140, 0.45)');
        sunGrad.addColorStop(0.4, 'rgba(253, 186, 116, 0.25)');
        sunGrad.addColorStop(1, 'rgba(253, 186, 116, 0.0)');

        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunPulse + 50, 0, Math.PI * 2);
        ctx.fill();

        // 2. Animated Rising Evaporation Vapor Streams
        ctx.fillStyle = 'rgba(186, 230, 253, 0.65)';
        for (const p of vaporParticles) {
          if (isPlaying) {
            p.y -= p.speedY * playbackSpeed;
            p.x += p.speedX + Math.sin(frame * 0.05 + p.y * 0.02) * 0.4;
            // Reset to lake surface
            if (p.y < height * 0.28) {
              p.y = height * (0.65 + Math.random() * 0.2);
              p.x = width * (0.65 + Math.random() * 0.22);
            }
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(186, 230, 253, ${p.alpha * 0.7})`;
          ctx.fill();
        }

        // 3. Animated Precipitation Falling Rain Streaks
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.6)';
        ctx.lineWidth = 1.5;
        for (const r of rainParticles) {
          if (isPlaying) {
            r.y += r.speedY * playbackSpeed;
            r.x -= 0.6 * playbackSpeed; // Slight wind drift
            if (r.y > height * 0.7) {
              r.y = height * (0.24 + Math.random() * 0.05);
              r.x = width * (0.42 + Math.random() * 0.28);
            }
          }
          ctx.beginPath();
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.x - 2, r.y + r.length);
          ctx.stroke();
        }

        // 4. Soft Pulsing Condensation Cloud Glow
        const cloudX = width * 0.65;
        const cloudY = height * 0.27;
        const cloudGlow = Math.sin(frame * 0.03) * 6 + 35;
        const cloudGrad = ctx.createRadialGradient(cloudX, cloudY, 15, cloudX, cloudY, cloudGlow + 70);
        cloudGrad.addColorStop(0, 'rgba(219, 234, 254, 0.22)');
        cloudGrad.addColorStop(1, 'rgba(219, 234, 254, 0)');
        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.arc(cloudX, cloudY, cloudGlow + 70, 0, Math.PI * 2);
        ctx.fill();

        // 5. Flowing River & Collection Currents
        const riverPulse = (frame * 1.5) % 100;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 12]);
        ctx.lineDashOffset = -riverPulse;
        ctx.beginPath();
        ctx.moveTo(width * 0.52, height * 0.56);
        ctx.quadraticCurveTo(width * 0.58, height * 0.65, width * 0.68, height * 0.76);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (lesson.id === 'human-heart') {
        // Rhythmic 72 BPM cardiac pulse
        const heartPulse = Math.sin(frame * 0.08) * 14 + 60;
        const heartGrad = ctx.createRadialGradient(width * 0.58, height * 0.48, 20, width * 0.58, height * 0.48, heartPulse + 90);
        heartGrad.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
        heartGrad.addColorStop(0.6, 'rgba(59, 130, 246, 0.2)');
        heartGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = heartGrad;
        ctx.beginPath();
        ctx.arc(width * 0.58, height * 0.48, heartPulse + 90, 0, Math.PI * 2);
        ctx.fill();

        // ECG Heart Monitor Trace Line at bottom right
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const ecgY = height * 0.82;
        const ecgX0 = width * 0.72;
        const ecgW = width * 0.22;
        ctx.moveTo(ecgX0, ecgY);
        for (let x = 0; x < ecgW; x += 3) {
          const t = (frame * 3 + x) % 180;
          let spike = 0;
          if (t > 40 && t < 50) spike = -12; // P wave
          else if (t > 70 && t < 74) spike = 8; // Q
          else if (t >= 74 && t < 80) spike = -38; // R peak
          else if (t >= 80 && t < 85) spike = 14; // S
          else if (t > 110 && t < 125) spike = -10; // T wave
          ctx.lineTo(ecgX0 + x, ecgY + spike);
        }
        ctx.stroke();
      } else if (lesson.id === 'solar-system') {
        // Deep space orbital rings
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.22)';
        ctx.lineWidth = 1.2;
        [70, 120, 175, 230, 290].forEach((r, idx) => {
          ctx.beginPath();
          ctx.ellipse(width * 0.58, height * 0.5, r, r * 0.44, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Orbiting planets
          const angle = frame * (0.015 / (idx + 1)) + idx * 1.3;
          const px = width * 0.58 + Math.cos(angle) * r;
          const py = height * 0.5 + Math.sin(angle) * (r * 0.44);
          ctx.fillStyle = ['#38bdf8', '#34d399', '#f97316', '#eab308', '#a855f7'][idx];
          ctx.beginPath();
          ctx.arc(px, py, 4 + idx * 1.2, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (lesson.id === 'plant-cell') {
        // Streaming cytoplasmic chloroplasts
        ctx.fillStyle = 'rgba(74, 222, 128, 0.45)';
        for (let i = 0; i < 18; i++) {
          const angle = frame * 0.02 + i * 0.35;
          const rx = 140 + Math.sin(i * 2) * 40;
          const ry = 90 + Math.cos(i * 3) * 30;
          const cx = width * 0.58 + Math.cos(angle) * rx;
          const cy = height * 0.5 + Math.sin(angle) * ry;
          ctx.beginPath();
          ctx.ellipse(cx, cy, 6, 10, angle, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (lesson.id === 'volcano') {
        // Magma glow & rising ash specks
        const magmaPulse = Math.sin(frame * 0.06) * 15 + 50;
        const magmaGrad = ctx.createRadialGradient(width * 0.58, height * 0.65, 10, width * 0.58, height * 0.65, magmaPulse + 60);
        magmaGrad.addColorStop(0, 'rgba(239, 68, 68, 0.5)');
        magmaGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.25)');
        magmaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = magmaGrad;
        ctx.beginPath();
        ctx.arc(width * 0.58, height * 0.65, magmaPulse + 60, 0, Math.PI * 2);
        ctx.fill();

        // Rising ash/pyroclast particles
        ctx.fillStyle = 'rgba(251, 146, 60, 0.7)';
        for (let i = 0; i < 24; i++) {
          const py = (height * 0.55 - ((frame * 2 + i * 22) % (height * 0.45)));
          const px = width * 0.58 + Math.sin(frame * 0.05 + i) * (20 + (height * 0.55 - py) * 0.3);
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (lesson.id === 'electric-circuit') {
        // Flowing current / electrons
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.lineWidth = 4;
        const rectX = width * 0.42;
        const rectY = height * 0.35;
        const rectW = width * 0.34;
        const rectH = height * 0.42;
        ctx.strokeRect(rectX, rectY, rectW, rectH);

        // Electron particles circulating perimeter
        const perimeter = (rectW + rectH) * 2;
        ctx.fillStyle = '#fde047';
        for (let i = 0; i < 14; i++) {
          let dist = ((frame * 3 + i * (perimeter / 14)) % perimeter);
          let ex = rectX;
          let ey = rectY;
          if (dist < rectW) {
            ex = rectX + dist;
            ey = rectY;
          } else if (dist < rectW + rectH) {
            ex = rectX + rectW;
            ey = rectY + (dist - rectW);
          } else if (dist < rectW * 2 + rectH) {
            ex = rectX + rectW - (dist - (rectW + rectH));
            ey = rectY + rectH;
          } else {
            ex = rectX;
            ey = rectY + rectH - (dist - (rectW * 2 + rectH));
          }
          ctx.beginPath();
          ctx.arc(ex, ey, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Filament bulb glow
        const bulbGlow = Math.sin(frame * 0.1) * 8 + 35;
        const bulbGrad = ctx.createRadialGradient(rectX + rectW * 0.8, rectY, 5, rectX + rectW * 0.8, rectY, bulbGlow + 30);
        bulbGrad.addColorStop(0, 'rgba(253, 224, 71, 0.7)');
        bulbGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.3)');
        bulbGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bulbGrad;
        ctx.beginPath();
        ctx.arc(rectX + rectW * 0.8, rectY, bulbGlow + 30, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [lesson.id, isPlaying, playbackSpeed]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[16/9] max-h-[580px] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 group select-none"
    >
      {/* 1. CINEMATIC VIDEO BACKGROUND LAYER - Same Educator Avatar on Left for All Models */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Real Classroom Photo with Dr. Sarah Jenkins on left gesturing towards the presentation stage */}
        <img
          src="/assets/prototype/classroom-hero.png?v=clean2"
          alt="Classroom Simulation"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out"
        />

        {/* Dynamic Presentation Board on Right for other Models (where the teacher is gesturing) */}
        {lesson.id !== 'water-cycle' && (
          <div className="absolute top-[4%] bottom-[12%] left-[34%] right-[1.5%] z-10 flex flex-col items-center justify-center pointer-events-auto">
            <div className="relative w-full h-full rounded-2xl sm:rounded-3xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/35 shadow-[0_0_50px_rgba(37,99,235,0.35)] overflow-hidden flex items-center justify-center p-3 sm:p-5">
              {/* Radial ambient backglow */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/25 via-transparent to-slate-950 pointer-events-none" />

              {/* Holographic Header Bar */}
              <div className="absolute top-2.5 sm:top-3 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between z-20 pointer-events-none">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase text-cyan-300 font-semibold truncate max-w-[180px] sm:max-w-xs">
                    {lesson.title.split(':')[0]}
                  </span>
                </div>
                <div className="px-2.5 py-0.5 sm:py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-[9px] sm:text-[10px] text-blue-300 font-medium tracking-wide">
                  {chapters.find((c) => c.id === activeChapterId)?.stageName || 'Interactive 3D Stage'}
                </div>
              </div>

              {/* High-Resolution Lesson Model Artwork */}
              <img
                src={LESSON_ARTWORK[lesson.id] || lesson.coverImage}
                alt={lesson.title}
                className="max-h-[85%] max-w-[85%] object-contain drop-shadow-[0_0_45px_rgba(59,130,246,0.5)] transition-transform duration-500 hover:scale-105 select-none"
              />
            </div>
          </div>
        )}

        {/* Dynamic HTML5 Canvas for particles, sunlight rays, rain, and water flows */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-15" />

        {/* Subtle ambient lighting vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/30 pointer-events-none z-15" />
      </div>

      {/* 2. AUTHENTIC PHOTOREALISTIC LIP & EYE ARTICULATION OVERLAY (Active for Dr. Sarah Jenkins across All Models) */}
      <svg
        viewBox="0 0 1024 580"
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
        preserveAspectRatio="xMidYMid slice"
      >
          <defs>
            <filter id="heroLipSoft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.65" />
            </filter>
            <filter id="heroTeethSoft" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="0.32" />
            </filter>
            <filter id="heroApertureSoft" x="-15%" y="-15%" width="130%" height="130%">
              <feGaussianBlur stdDeviation="0.45" />
            </filter>
            <filter id="heroSkinBlend" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.75" />
            </filter>

            {/* Oral cavity shadow gradient */}
            <linearGradient id="heroOralCavityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0d0204" />
              <stop offset="50%" stopColor="#25050b" />
              <stop offset="100%" stopColor="#3c0e15" />
            </linearGradient>

            {/* Upper teeth enamel gradient */}
            <linearGradient id="heroTeethGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#fbf7f0" />
              <stop offset="100%" stopColor="#dfd2c6" />
            </linearGradient>

            {/* Lower teeth enamel gradient */}
            <linearGradient id="heroLowerTeethGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f5f0e6" />
              <stop offset="100%" stopColor="#c5b6a7" />
            </linearGradient>

            {/* Natural upper lip vermillion gradient */}
            <linearGradient id="heroUpperLipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#bf5259" />
              <stop offset="45%" stopColor="#d56d74" />
              <stop offset="100%" stopColor="#96373e" />
            </linearGradient>

            {/* Natural lower lip vermillion gradient matching Dr. Sarah Jenkins */}
            <linearGradient id="heroLowerLipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ba4a53" />
              <stop offset="25%" stopColor="#d97277" />
              <stop offset="65%" stopColor="#ce646b" />
              <stop offset="100%" stopColor="#9e3b44" />
            </linearGradient>

            {/* Natural tongue gradient */}
            <linearGradient id="heroTongueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ba4858" />
              <stop offset="100%" stopColor="#7a242f" />
            </linearGradient>
          </defs>

          {/* EYE BLINKING & GAZE */}
          <g id="heroTeacherEyes">
            {/* Left Eye Blink */}
            {blinkProgress > 0.05 && (
              <path
                d={`M 158 132 Q 174 ${132 + blinkProgress * 7} 190 133 Q 174 ${132 - (1 - blinkProgress) * 2} 158 132 Z`}
                fill="#c99781"
                filter="url(#heroSkinBlend)"
                opacity="0.96"
              />
            )}
            {/* Right Eye Blink */}
            {blinkProgress > 0.05 && (
              <path
                d={`M 206 134 Q 222 ${134 + blinkProgress * 7} 238 134 Q 222 ${134 - (1 - blinkProgress) * 2} 206 134 Z`}
                fill="#c99781"
                filter="url(#heroSkinBlend)"
                opacity="0.96"
              />
            )}
          </g>

          {/* COMPLETE FULL-MOUTH ARTICULATION (Aligned with exact photo coordinates x=165.5 to x=220.5, center=193) */}
          {smoothJaw > 0.005 && (() => {
            const jawNorm = Math.min(1.0, smoothJaw);
            const widthNorm = Math.max(-1.0, Math.min(1.0, smoothWidth));
            const roundNorm = Math.max(0.0, Math.min(1.0, smoothRound));

            // 1. Dynamic Upper Lip Elevation:
            // Elevates on open & spread vowels, exposing upper incisors; pursing down on rounded vowels
            const upperLipLift = (jawNorm * 3.8 + Math.max(0, widthNorm) * 2.8) - (roundNorm * 2.2);

            // 2. Dynamic Lower Lip & Mandible Depression:
            const lowerLipDrop = jawNorm * 11.2 + (roundNorm * 1.5);

            // 3. Dynamic Mouth Commissures (Full mouth width along authentic tilted facial axis):
            const cornerSpreadX = widthNorm * 5.2 - roundNorm * 4.5;
            const cornerLiftY = Math.max(0, widthNorm * 2.2) - (jawNorm * 0.8);

            // Exact measured left corner: x=165.5, y=194.0
            const lx = 165.5 - cornerSpreadX;
            const ly = 194.0 - cornerLiftY;

            // Exact measured right corner: x=220.5, y=201.5
            const rx = 220.5 + cornerSpreadX;
            const ry = 201.5 - cornerLiftY;

            // Exact center of mouth and philtrum: x=193.0
            const cx = 193.0 + (widthNorm * 0.5);

            // Dynamic Oral Fissure lines (following facial tilt):
            const upperFissureY = 197.5 - upperLipLift;
            const lowerFissureY = 201.5 + lowerLipDrop;
            const totalOpening = Math.max(0, lowerFissureY - upperFissureY);

            // Cupid's Bow and Upper Lip Contour (anchored at authentic anatomical peaks):
            const cupidCenterY = 192.5 - upperLipLift * 0.45;
            const peakLeftX = 188.0 - cornerSpreadX * 0.25;
            const peakLeftY = 191.0 - upperLipLift * 0.45;
            const peakRightX = 198.0 + cornerSpreadX * 0.25;
            const peakRightY = 192.5 - upperLipLift * 0.45;

            // Lower Lip Vermillion Bottom Contour:
            const lowerLipBottomY = 216.0 + lowerLipDrop * 0.78;

            const groupOpacity = Math.min(1.0, smoothJaw * 5.0);

            return (
              <g id="heroDynamicFullMouthRig" opacity={groupOpacity} className="transition-opacity duration-75">
                {/* 1. Deep Oral Cavity Aperture (Full mouth width span from 165.5 to 220.5) */}
                <path
                  d={`M ${lx} ${ly}
                      C ${lx + 10} ${upperFissureY - 1.0}, ${rx - 10} ${upperFissureY}, ${rx} ${ry}
                      C ${rx - 8} ${lowerFissureY + 0.5}, ${lx + 8} ${lowerFissureY - 0.5}, ${lx} ${ly} Z`}
                  fill="url(#heroOralCavityGrad)"
                  filter="url(#heroApertureSoft)"
                />

                {/* 2. Full Upper Incisor Dental Arch (Span x=170 to x=216) */}
                {totalOpening > 1.0 && (
                  <path
                    d={`M ${lx + 5} ${ly + 0.8}
                        C ${lx + 12} ${upperFissureY - 0.5}, ${rx - 12} ${upperFissureY + 0.5}, ${rx - 5} ${ry + 0.8}
                        C ${rx - 10} ${upperFissureY + Math.min(4.5, totalOpening * 0.42)}, ${lx + 10} ${upperFissureY + Math.min(4.5, totalOpening * 0.42) - 0.5}, ${lx + 5} ${ly + 0.8} Z`}
                    fill="url(#heroTeethGrad)"
                    filter="url(#heroTeethSoft)"
                    opacity={0.96}
                  />
                )}

                {/* 3. Dynamic Tongue Contours (Vowels & Dental Visemes) */}
                {(viseme.tongueOut || viseme.viseme === 'th' || viseme.viseme === 'aa' || jawNorm > 0.18) && totalOpening > 3.0 && (
                  <ellipse
                    cx={cx}
                    cy={upperFissureY + totalOpening * 0.68}
                    rx={12.0 + widthNorm * 1.5}
                    ry={Math.max(1.5, totalOpening * 0.28)}
                    fill="url(#heroTongueGrad)"
                    filter="url(#heroApertureSoft)"
                    opacity={0.94}
                    transform={`rotate(7.8, ${cx}, ${upperFissureY + totalOpening * 0.68})`}
                  />
                )}

                {/* 4. Lower Incisors (Visible on wide open vowels & dental visemes) */}
                {totalOpening > 6.0 && (
                  <path
                    d={`M ${lx + 8} ${lowerFissureY - 0.5}
                        C ${lx + 14} ${lowerFissureY - 3.0}, ${rx - 14} ${lowerFissureY - 2.5}, ${rx - 8} ${lowerFissureY + 0.2}
                        C ${rx - 11} ${lowerFissureY + 0.5}, ${lx + 11} ${lowerFissureY}, ${lx + 8} ${lowerFissureY - 0.5} Z`}
                    fill="url(#heroLowerTeethGrad)"
                    filter="url(#heroTeethSoft)"
                    opacity={0.88}
                  />
                )}

                {/* 5. Full Articulating Upper Lip Vermillion (Cupid's Bow to Fissure covering entire upper lip) */}
                <path
                  d={`M ${lx} ${ly}
                      C ${lx + 8} ${cupidCenterY + 1.5}, ${peakLeftX - 3} ${peakLeftY}, ${peakLeftX} ${peakLeftY}
                      Q ${cx} ${cupidCenterY + 1.0} ${peakRightX} ${peakRightY}
                      C ${peakRightX + 3} ${peakRightY}, ${rx - 8} ${cupidCenterY + 2.5}, ${rx} ${ry}
                      C ${rx - 10} ${upperFissureY + 0.5}, ${lx + 10} ${upperFissureY - 0.5}, ${lx} ${ly} Z`}
                  fill="url(#heroUpperLipGrad)"
                  filter="url(#heroLipSoft)"
                  opacity={0.98}
                />

                {/* 6. Full Articulating Lower Lip Vermillion (Covering entire lower lip from corner to corner) */}
                <path
                  d={`M ${lx} ${ly}
                      C ${lx + 10} ${lowerFissureY - 0.5}, ${rx - 10} ${lowerFissureY + 0.5}, ${rx} ${ry}
                      C ${rx - 8} ${lowerLipBottomY + 0.8}, ${lx + 8} ${lowerLipBottomY - 0.8}, ${lx} ${ly} Z`}
                  fill="url(#heroLowerLipGrad)"
                  filter="url(#heroLipSoft)"
                  opacity={0.98}
                />
              </g>
            );
          })()}
        </svg>

      {/* 2.5 TAP TO UNMUTE PROMPT BANNER (Displayed until first student gesture unlocks browser audio) */}
      {!isAudioUnlocked && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
          <button
            onClick={() => {
              avatarAudioEngine.unlockAudio();
              const activeCh = chapters.find((c) => c.id === activeChapterId) || chapters[0];
              const textToSpeak = speechText && speechText.length > 20 ? speechText : (activeCh ? activeCh.description : 'Welcome to the lesson!');
              avatarAudioEngine.speak(textToSpeak, currentTeacher.voiceName);
            }}
            className="flex items-center gap-2.5 px-4 py-2 bg-blue-600/95 hover:bg-blue-500 text-white rounded-full shadow-2xl backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide transition-all hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-blue-500/30 animate-pulse"
            title="Click to enable educator voice narration"
          >
            <Volume2 className="w-4 h-4 text-cyan-300 animate-bounce" />
            <span>Click to Enable Teacher Audio</span>
          </button>
        </div>
      )}

      {/* 3. OPTIONAL HOTSPOT LABELS (Default: HIDDEN to eliminate screen clutter and keep view clean) */}
      {showHotspotLabels && lesson.id === 'water-cycle' && (
        <div className="absolute inset-0 z-20 pointer-events-none animate-in fade-in duration-200">
          {/* Condensation Hotspot */}
          <button
            onClick={() => {
              const ch = chapters.find((c) => c.id === 'condensation');
              if (ch) seekToChapter(ch);
            }}
            style={{ top: '26%', right: '41%' }}
            className={`absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 shadow-xl cursor-pointer ${
              activeChapterId === 'condensation'
                ? 'bg-blue-600 text-white ring-2 ring-white scale-105 shadow-blue-500/50'
                : 'bg-[#101f42]/90 hover:bg-blue-700 text-white border border-blue-400/40 hover:scale-105'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
            Condensation
          </button>

          {/* Precipitation Hotspot */}
          <button
            onClick={() => {
              const ch = chapters.find((c) => c.id === 'precipitation');
              if (ch) seekToChapter(ch);
            }}
            style={{ top: '41%', right: '53%' }}
            className={`absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 shadow-xl cursor-pointer ${
              activeChapterId === 'precipitation'
                ? 'bg-blue-600 text-white ring-2 ring-white scale-105 shadow-blue-500/50'
                : 'bg-[#101f42]/90 hover:bg-blue-700 text-white border border-blue-400/40 hover:scale-105'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />
            Precipitation
          </button>

          {/* Evaporation Hotspot */}
          <button
            onClick={() => {
              const ch = chapters.find((c) => c.id === 'evaporation');
              if (ch) seekToChapter(ch);
            }}
            style={{ top: '45%', right: '20%' }}
            className={`absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 shadow-xl cursor-pointer ${
              activeChapterId === 'evaporation'
                ? 'bg-blue-600 text-white ring-2 ring-white scale-105 shadow-blue-500/50'
                : 'bg-[#101f42]/90 hover:bg-blue-700 text-white border border-blue-400/40 hover:scale-105'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
            Evaporation
          </button>

          {/* Collection Hotspot */}
          <button
            onClick={() => {
              const ch = chapters.find((c) => c.id === 'collection');
              if (ch) seekToChapter(ch);
            }}
            style={{ top: '53%', right: '52%' }}
            className={`absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 shadow-xl cursor-pointer ${
              activeChapterId === 'collection'
                ? 'bg-blue-600 text-white ring-2 ring-white scale-105 shadow-blue-500/50'
                : 'bg-[#101f42]/90 hover:bg-blue-700 text-white border border-blue-400/40 hover:scale-105'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            Collection
          </button>
        </div>
      )}



      {/* Hotspots for Non-Water Cycle Lessons (Only visible when toggled on) */}
      {showHotspotLabels && lesson.id !== 'water-cycle' && (
        <div className="absolute inset-0 z-20 pointer-events-none animate-in fade-in duration-200">
          {lesson.labels.slice(0, 4).map((lbl, idx) => {
            const isSelected = activeLabel?.id === lbl.id;
            const topPositions = [28, 48, 64, 38];
            const rightPositions = [20, 36, 22, 44];
            const topP = topPositions[idx % topPositions.length];
            const rightP = rightPositions[idx % rightPositions.length];

            return (
              <button
                key={lbl.id}
                onClick={() => {
                  onSelectLabel(lbl);
                  onSetSpeechText(`${lbl.name}: ${lbl.shortExplanation}`);
                  avatarAudioEngine.triggerGesture('point', lbl.name, 4500, 'label');
                  if (isPlayingNarration) {
                    avatarAudioEngine.speak(lbl.shortExplanation, currentTeacher.voiceName);
                  }
                }}
                style={{ top: `${topP}%`, right: `${rightP}%` }}
                className={`absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 shadow-xl cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white ring-2 ring-white scale-110 shadow-blue-500/50'
                    : 'bg-[#101b3b]/90 hover:bg-blue-700 text-white border border-blue-400/30 hover:scale-105'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                {lbl.name}
              </button>
            );
          })}
        </div>
      )}

      {/* View Mode Selector: Normal View (Active) | 3D Simulation | AR View + Labels Toggle */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2 pointer-events-auto">
        <div className="flex items-center bg-[#0f172a]/85 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-xl">
          <button
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-[#2563eb] text-white shadow-md shadow-blue-500/30 cursor-default"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Normal View</span>
          </button>
          <button
            onClick={onSwitchTo3D}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>3D Simulation</span>
          </button>
          {onSwitchToAR && (
            <button
              onClick={onSwitchToAR}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <Box className="w-3.5 h-3.5" />
              <span>AR View</span>
            </button>
          )}

          {/* Quick Labels Toggle Button (Hidden by default to keep scene clean) */}
          <div className="w-px h-4 bg-white/20 mx-1" />
          <button
            onClick={() => setShowHotspotLabels(!showHotspotLabels)}
            title={showHotspotLabels ? 'Hide Labels (Clean Scene)' : 'Show Labels'}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              showHotspotLabels
                ? 'bg-blue-600/80 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {showHotspotLabels ? <Eye className="w-3.5 h-3.5 text-cyan-300" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px] font-semibold">{showHotspotLabels ? 'Labels ON' : 'Labels'}</span>
          </button>
        </div>
      </div>

      {/* 4. EDUCATIONAL CHAPTER BAR (Quick jump pills) */}
      <div className="absolute top-16 right-4 z-20 pointer-events-auto flex items-center gap-1 bg-[#0f172a]/85 backdrop-blur-md p-1 rounded-2xl border border-white/10 shadow-xl overflow-x-auto max-w-sm sm:max-w-md scrollbar-none">
        {chapters.map((ch) => {
          const isActive = activeChapterId === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => seekToChapter(ch)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {ch.label}
            </button>
          );
        })}
      </div>

      {/* 5. RIGHT SIDEBAR BUTTONS: 3D LAB & 2D DIAGRAM SWITCH PROMPTS */}
      <div className="absolute top-28 right-4 z-20 flex flex-col items-end gap-2 pointer-events-auto">
        <button
          onClick={onSwitchTo3D}
          className="group/btn bg-[#0f172a]/90 hover:bg-blue-600 backdrop-blur-md border border-white/15 rounded-2xl px-3 py-2 flex items-center gap-2 text-white shadow-xl transition-all hover:scale-105 cursor-pointer"
          title="Open interactive 3D simulation lab"
        >
          <Layers className="w-4 h-4 text-cyan-400 group-hover/btn:text-white" />
          <div className="text-left">
            <span className="text-[10px] text-slate-300 group-hover/btn:text-white block font-medium leading-none">
              Explore Model
            </span>
            <span className="text-xs font-bold leading-none">Open 3D Lab</span>
          </div>
        </button>

        {onSwitchToDiagram && (
          <button
            onClick={onSwitchToDiagram}
            className="group/btn bg-[#0f172a]/90 hover:bg-emerald-600 backdrop-blur-md border border-white/15 rounded-2xl px-3 py-2 flex items-center gap-2 text-white shadow-xl transition-all hover:scale-105 cursor-pointer"
            title="Open scientific 2D schematic diagram"
          >
            <Compass className="w-4 h-4 text-emerald-400 group-hover/btn:text-white" />
            <div className="text-left">
              <span className="text-[10px] text-slate-300 group-hover/btn:text-white block font-medium leading-none">
                Schematic
              </span>
              <span className="text-xs font-bold leading-none">2D Diagram</span>
            </div>
          </button>
        )}
      </div>

      {/* 6. BOTTOM SPEECH NARRATION CARD */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl px-4 py-2.5 flex items-center gap-3 w-[94%] max-w-2xl pointer-events-auto">
        <button
          onClick={() => {
            avatarAudioEngine.unlockAudio();
            avatarAudioEngine.triggerGesture('point', lesson.title, 4500, 'speech');
            const activeCh = chapters.find((c) => c.id === activeChapterId) || chapters[0];
            const textToSpeak = speechText && speechText.length > 20 ? speechText : activeCh.description;
            avatarAudioEngine.speak(textToSpeak, currentTeacher.voiceName);
          }}
          title="Play educator voice narration with real-time lip movement"
          className="px-3 py-1.5 rounded-xl bg-[#2563eb] hover:bg-blue-600 text-white flex items-center gap-1.5 shrink-0 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer font-semibold text-xs"
        >
          <Volume2 className="w-4 h-4 animate-pulse" />
          <span>Speak & Sync</span>
        </button>

        {/* Dedicated Voice Sound Test Button */}
        <button
          onClick={() => {
            avatarAudioEngine.testSound(currentTeacher.voiceName);
          }}
          title="Verify speaker sound output"
          className="hidden xs:flex px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 items-center gap-1 shrink-0 text-[11px] font-semibold transition-all cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Test Sound</span>
        </button>

        {/* Live Audio & Lip Articulation Waveforms */}
        <div className="flex items-center gap-0.5 h-4 px-1" title="Teacher Lip Articulation Waveform">
          <span
            className={`w-1 rounded-full transition-all duration-150 ${
              isTeacherSpeaking || (isPlaying && isPlayingNarration)
                ? 'bg-blue-600 animate-pulse h-4'
                : 'bg-slate-300 h-1.5'
            }`}
          />
          <span
            className={`w-1 rounded-full transition-all duration-150 ${
              isTeacherSpeaking || (isPlaying && isPlayingNarration)
                ? 'bg-blue-500 animate-pulse h-3'
                : 'bg-slate-300 h-2'
            }`}
          />
          <span
            className={`w-1 rounded-full transition-all duration-150 ${
              isTeacherSpeaking || (isPlaying && isPlayingNarration)
                ? 'bg-cyan-500 animate-pulse h-5'
                : 'bg-slate-300 h-1.5'
            }`}
          />
        </div>

        <p className="text-xs sm:text-[13px] text-slate-800 font-medium leading-relaxed flex-1 select-none text-left line-clamp-2">
          {speechText}
        </p>

        {/* Lip Sync & Audio Active Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200/80 text-[10px] font-bold text-blue-700 shrink-0">
          <span
            className={`w-2 h-2 rounded-full ${
              isTeacherSpeaking || (isPlaying && isPlayingNarration)
                ? 'bg-emerald-500 animate-ping'
                : 'bg-blue-400'
            }`}
          />
          <span>{isTeacherSpeaking ? 'Voice Playing' : isPlaying && isPlayingNarration ? 'Lip Sync Active' : 'Voice Ready'}</span>
        </div>
      </div>

      {/* 7. VIDEO PLAYER HUD CONTROLS BAR */}
      <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pt-6 pb-2 px-4 pointer-events-auto">
        {/* Timeline Progress Bar with Chapter Markers */}
        <div className="relative w-full h-1.5 bg-slate-800/90 rounded-full mb-2 cursor-pointer group/bar overflow-visible">
          {/* Filled progress */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-blue-500 rounded-full transition-all duration-150"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />

          {/* Chapter notch indicators */}
          {chapters.map((ch) => {
            const perc = (ch.time / duration) * 100;
            return (
              <button
                key={ch.id}
                onClick={(e) => {
                  e.stopPropagation();
                  seekToChapter(ch);
                }}
                style={{ left: `${perc}%` }}
                title={`${ch.label} (${formatTime(ch.time)})`}
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full border transition-all ${
                  activeChapterId === ch.id
                    ? 'bg-white border-blue-400 ring-2 ring-blue-500 scale-125'
                    : 'bg-slate-400 border-slate-700 hover:scale-125'
                }`}
              />
            );
          })}

          {/* Scrub click handler */}
          <input
            type="range"
            min={0}
            max={duration}
            step={0.5}
            value={currentTime}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setCurrentTime(val);
            }}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>

        {/* HUD Button Controls */}
        <div className="flex items-center justify-between text-slate-300 text-xs">
          {/* Left Controls: Play/Pause, Rewind, Timestamp */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                const nextPlaying = !isPlaying;
                setIsPlaying(nextPlaying);
                avatarAudioEngine.unlockAudio();
                if (nextPlaying && isPlayingNarration) {
                  const activeCh = chapters.find((c) => c.id === activeChapterId) || chapters[0];
                  avatarAudioEngine.speak(activeCh.description, currentTeacher.voiceName);
                } else if (!nextPlaying) {
                  avatarAudioEngine.stop();
                }
              }}
              className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-colors cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
              className="p-1 hover:text-white transition-colors"
              title="Rewind 5s"
            >
              <Rewind className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setCurrentTime(Math.min(duration, currentTime + 5))}
              className="p-1 hover:text-white transition-colors"
              title="Fast Forward 5s"
            >
              <FastForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setCurrentTime(0);
                setIsPlaying(true);
              }}
              className="p-1 hover:text-white transition-colors"
              title="Restart Video"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <span className="font-mono text-[11px] text-slate-400 ml-1">
              <span className="text-white font-semibold">{formatTime(currentTime)}</span> / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls: Speed, Audio, Fullscreen */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const speeds = [0.75, 1.0, 1.25, 1.5];
                const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                setPlaybackSpeed(speeds[nextIdx]);
              }}
              className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700/80 hover:border-slate-500 text-[10px] font-mono font-semibold text-slate-200 transition-colors"
              title="Playback Speed"
            >
              {playbackSpeed}x
            </button>

            <button
              onClick={onToggleNarration}
              className={`p-1 transition-colors ${isPlayingNarration ? 'text-blue-400' : 'text-slate-500'}`}
              title={isPlayingNarration ? 'Mute Teacher Narration' : 'Enable Narration'}
            >
              {isPlayingNarration ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  containerRef.current?.requestFullscreen();
                }
              }}
              className="p-1 hover:text-white transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
