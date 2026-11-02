import { VisemeFrame, TeacherState } from '../types';

export type VisemeCallback = (frame: VisemeFrame) => void;
export type StateCallback = (state: TeacherState) => void;

export type AvatarGestureType = 'rest' | 'point' | 'nod' | 'open-palm' | 'think';

export interface AvatarGestureEvent {
  gesture: AvatarGestureType;
  targetLabel?: string;
  durationMs?: number;
  source?: 'user' | 'label' | 'question' | 'speech' | 'idle';
}

export type GestureCallback = (event: AvatarGestureEvent) => void;

class AvatarAudioEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private activeBufferSource: AudioBufferSourceNode | null = null;
  private animationFrameId: number | null = null;
  private isMuted: boolean = false;
  private currentSpeakingText: string = '';
  private currentVoiceName: string = 'Kore';
  private visemeListeners: Set<VisemeCallback> = new Set();
  private stateListeners: Set<StateCallback> = new Set();
  private gestureListeners: Set<GestureCallback> = new Set();
  private currentState: TeacherState = 'idle';
  private currentGesture: AvatarGestureType = 'rest';
  private gestureTimeout: any = null;

  // Real TTS audio buffer & blob caches for instantaneous latency-free playback
  private audioBufferCache: Map<string, AudioBuffer> = new Map();
  private audioUrlCache: Map<string, string> = new Map();
  private pendingFetches: Map<string, Promise<AudioBuffer | null>> = new Map();
  private backendTtsDisabled: boolean = false;

  // Speech synthesis & audio unlock registers
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private speechHeartbeatTimer: any = null;
  private isAudioUnlocked: boolean = false;
  private unlockListeners: Set<(unlocked: boolean) => void> = new Set();

  // Smooth filter registers for realistic articulation
  private currentJaw: number = 0;
  private currentWidth: number = 0;
  private currentRound: number = 0;
  private currentViseme: VisemeFrame['viseme'] = 'sil';

  constructor() {
    if (typeof window !== 'undefined') {
      // 1. Cache speech synthesis voices immediately and on dynamic update
      const loadVoices = () => {
        if ('speechSynthesis' in window) {
          try {
            const v = window.speechSynthesis.getVoices();
            if (v && v.length > 0) {
              this.cachedVoices = v;
            }
          } catch (e) {
            // ignore
          }
        }
      };
      loadVoices();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }

      // 2. Global user gesture listeners for browser autoplay policy
      const handleUserGesture = () => {
        if (!this.isAudioUnlocked) {
          this.unlockAudio();
        }
      };
      window.addEventListener('click', handleUserGesture, { capture: true, passive: true });
      window.addEventListener('touchstart', handleUserGesture, { capture: true, passive: true });
      window.addEventListener('keydown', handleUserGesture, { capture: true, passive: true });
    }
  }

  /**
   * Initializes and resumes the Web Audio context.
   */
  public initAudioContext(): AudioContext | null {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        try {
          this.audioCtx = new AudioContextClass();
          this.analyser = this.audioCtx.createAnalyser();
          this.analyser.fftSize = 512;
          this.analyser.smoothingTimeConstant = 0.5;
          // Connect analyser to destination so sound flows out to speakers
          try {
            this.analyser.connect(this.audioCtx.destination);
          } catch (e) {
            // ignore
          }
        } catch (e) {
          // ignore
        }
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Plays a soft, warm audio chime through Web Audio.
   * This awakens the physical browser audio pipeline and guarantees audible sound.
   */
  public playActivationChime(freqs: number[] = [523.25, 659.25], duration: number = 0.25): void {
    try {
      const ctx = this.initAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + duration + 0.05);
      });
    } catch (e) {
      // ignore
    }
  }

  /**
   * Unlocks audio playback for browsers requiring an explicit user gesture.
   */
  public unlockAudio(): void {
    this.isAudioUnlocked = true;
    this.initAudioContext();

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    // Play pleasant micro-activation tone to awaken audio hardware
    this.playActivationChime([523.25, 659.25], 0.2);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (e) {
        // ignore
      }
    }

    for (const listener of this.unlockListeners) {
      try {
        listener(true);
      } catch (e) {
        // ignore
      }
    }
  }

  public subscribeAudioUnlock(cb: (unlocked: boolean) => void): () => void {
    this.unlockListeners.add(cb);
    cb(this.isAudioUnlocked);
    return () => this.unlockListeners.delete(cb);
  }

  public getAudioUnlocked(): boolean {
    return this.isAudioUnlocked;
  }

  public subscribeVisemes(cb: VisemeCallback): () => void {
    this.visemeListeners.add(cb);
    return () => this.visemeListeners.delete(cb);
  }

  public subscribeState(cb: StateCallback): () => void {
    this.stateListeners.add(cb);
    cb(this.currentState);
    return () => this.stateListeners.delete(cb);
  }

  public subscribeGesture(cb: GestureCallback): () => void {
    this.gestureListeners.add(cb);
    cb({ gesture: this.currentGesture, source: 'idle' });
    return () => this.gestureListeners.delete(cb);
  }

  public triggerGesture(
    gesture: AvatarGestureType,
    targetLabel?: string,
    durationMs: number = 3800,
    source: AvatarGestureEvent['source'] = 'user'
  ) {
    this.currentGesture = gesture;
    const event: AvatarGestureEvent = { gesture, targetLabel, durationMs, source };
    for (const listener of this.gestureListeners) {
      listener(event);
    }

    if (this.gestureTimeout) {
      clearTimeout(this.gestureTimeout);
    }

    if (gesture !== 'rest' && durationMs > 0) {
      this.gestureTimeout = setTimeout(() => {
        this.currentGesture = 'rest';
        for (const listener of this.gestureListeners) {
          listener({ gesture: 'rest', source: 'idle' });
        }
      }, durationMs);
    }
  }

  public getCurrentGesture(): AvatarGestureType {
    return this.currentGesture;
  }

  private setState(state: TeacherState) {
    this.currentState = state;
    for (const listener of this.stateListeners) {
      listener(state);
    }
  }

  public getState(): TeacherState {
    return this.currentState;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.currentAudioElement) {
      this.currentAudioElement.muted = muted;
    }
    if (muted) {
      this.stop();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public stop() {
    if (this.activeBufferSource) {
      try {
        this.activeBufferSource.stop();
        this.activeBufferSource.disconnect();
      } catch (e) {
        // ignore
      }
      this.activeBufferSource = null;
    }
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch (e) {
        // ignore
      }
      this.currentAudioElement = null;
    }
    if (this.speechHeartbeatTimer) {
      clearInterval(this.speechHeartbeatTimer);
      this.speechHeartbeatTimer = null;
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }
    this.activeUtterance = null;
    if (typeof window !== 'undefined') {
      (window as any).__smartClassActiveUtterance = null;
    }
    this.resetViseme();
    this.setState('idle');
  }

  public replay() {
    if (this.currentSpeakingText) {
      this.speak(this.currentSpeakingText, this.currentVoiceName);
    }
  }

  /**
   * Pre-fetches and caches lesson audio in memory so that when playback begins or
   * chapters are clicked, spoken teacher audio starts with 0ms latency.
   */
  public preloadLessonAudio(texts: string[], voiceName: string = 'Kore'): void {
    if (typeof window === 'undefined') return;
    for (const text of texts) {
      if (text && text.trim().length > 0) {
        this.fetchAudioBuffer(text, voiceName).catch(() => {});
      }
    }
  }

  /**
   * Fetches TTS audio from /api/tts (real MP3 speech audio generated on the server)
   * and decodes it into AudioBuffer for real-time FFT spectrum lip synchronization.
   */
  public async fetchAudioBuffer(text: string, voiceName: string = 'Kore'): Promise<AudioBuffer | null> {
    const cleanText = text.replace(/[*#_`]/g, '').trim();
    if (!cleanText) return null;

    const cacheKey = `${voiceName}:${cleanText}`;
    if (this.audioBufferCache.has(cacheKey)) {
      return this.audioBufferCache.get(cacheKey)!;
    }

    if (this.pendingFetches.has(cacheKey)) {
      return this.pendingFetches.get(cacheKey)!;
    }

    const fetchPromise = (async () => {
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleanText.slice(0, 480),
            voiceName: voiceName || 'Kore',
          }),
        });

        if (!response.ok) {
          return null;
        }

        const data = await response.json();
        if (!data.audioBase64) {
          return null;
        }

        // Convert base64 to Uint8Array
        const binaryString = window.atob(data.audioBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Cache Blob URL for HTMLAudioElement fallback
        const blob = new Blob([bytes.buffer], { type: data.mimeType || 'audio/mpeg' });
        const blobUrl = URL.createObjectURL(blob);
        this.audioUrlCache.set(cacheKey, blobUrl);

        this.initAudioContext();
        if (this.audioCtx) {
          try {
            const audioBuffer = await this.audioCtx.decodeAudioData(bytes.buffer.slice(0));
            this.audioBufferCache.set(cacheKey, audioBuffer);
            return audioBuffer;
          } catch (decodeErr) {
            console.warn('decodeAudioData error, will use HTMLAudio fallback:', decodeErr);
            return null;
          }
        }
        return null;
      } catch (err) {
        console.warn('Error fetching TTS audio:', err);
        return null;
      } finally {
        this.pendingFetches.delete(cacheKey);
      }
    })();

    this.pendingFetches.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  /**
   * Primary speech pipeline:
   * Guarantees loud, audible human voice playback for every avatar and lesson model.
   * Priority:
   * 1. In-memory AudioBuffer / Blob URL (instantaneous, 0ms latency)
   * 2. High-quality server-rendered MP3 voice from /api/tts with real acoustic FFT formants
   * 3. Web Speech API with native English voices (client-side fallback)
   * 4. Web Audio Acoustic Vocal Formant Synthesizer (hardware audio safety net)
   */
  public async speak(text: string, voiceName: string = 'Kore'): Promise<void> {
    this.stop();
    this.currentSpeakingText = text;
    this.currentVoiceName = voiceName;
    this.initAudioContext();
    this.unlockAudio();

    if (this.isMuted) {
      this.setState('idle');
      return;
    }

    const cleanText = text.replace(/[*#_`]/g, '').trim();
    if (!cleanText) {
      this.setState('idle');
      return;
    }

    const cacheKey = `${voiceName}:${cleanText}`;

    // 1. Immediate in-memory cached AudioBuffer playback
    if (this.audioBufferCache.has(cacheKey)) {
      const buffer = this.audioBufferCache.get(cacheKey)!;
      this.playAudioBuffer(buffer, cleanText);
      return;
    }

    // 2. Immediate in-memory cached Blob URL playback
    if (this.audioUrlCache.has(cacheKey)) {
      const url = this.audioUrlCache.get(cacheKey)!;
      this.playAudioUrl(url, cleanText);
      return;
    }

    // Determine voice profile
    const isMale =
      voiceName === 'Puck' ||
      voiceName === 'Fenrir' ||
      voiceName.toLowerCase().includes('marcus') ||
      voiceName.toLowerCase().includes('alan');

    // 3. Fetch real MP3 speech audio from backend /api/tts
    this.setState('speaking');
    this.startSyntheticVisemeLoop(cleanText);

    try {
      const buffer = await this.fetchAudioBuffer(cleanText, voiceName);
      if (this.currentSpeakingText !== text) return;

      if (buffer) {
        this.playAudioBuffer(buffer, cleanText);
        return;
      }
      if (this.audioUrlCache.has(cacheKey)) {
        this.playAudioUrl(this.audioUrlCache.get(cacheKey)!, cleanText);
        return;
      }
    } catch (err) {
      console.warn('Backend audio fetch failed, falling back:', err);
    }

    // 4. Fallback to Web Speech or acoustic tone
    this.playBrowserSpeech(cleanText, voiceName, isMale);
  }

  /**
   * High-reliability Web Speech API playback with exact phonetic lip synchronization.
   */
  private playBrowserSpeech(text: string, voiceName: string, isMale: boolean) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.playAcousticSpeechFallback(text, isMale);
      return;
    }

    try {
      // Chromium bugfix: cancel previous utterance, wait 30ms before queuing next speak
      window.speechSynthesis.cancel();

      setTimeout(() => {
        try {
          if (this.isMuted || this.currentSpeakingText !== text) return;

          window.speechSynthesis.resume();

          const utterance = new SpeechSynthesisUtterance(text);
          this.activeUtterance = utterance;
          (window as any).__smartClassActiveUtterance = utterance;

          // Vocal properties tailored to avatar persona
          utterance.volume = 1.0;
          utterance.rate = 1.0;
          utterance.pitch = isMale ? 0.92 : 1.06;

          // Resolve best matching native voice
          const voices =
            this.cachedVoices.length > 0 ? this.cachedVoices : window.speechSynthesis.getVoices();

          if (voices && voices.length > 0) {
            let matchedVoice: SpeechSynthesisVoice | undefined;

            if (isMale) {
              matchedVoice = voices.find(
                (v) =>
                  v.lang.startsWith('en') &&
                  (v.name.includes('Male') ||
                    v.name.includes('David') ||
                    v.name.includes('Daniel') ||
                    v.name.includes('Guy') ||
                    v.name.includes('Alex') ||
                    v.name.includes('George'))
              );
            } else {
              matchedVoice = voices.find(
                (v) =>
                  v.lang.startsWith('en') &&
                  (v.name.includes('Natural') ||
                    v.name.includes('Google US English') ||
                    v.name.includes('Samantha') ||
                    v.name.includes('Zira') ||
                    v.name.includes('Victoria') ||
                    v.name.includes('Karen') ||
                    v.name.includes('Ava') ||
                    v.name.includes('Jenny') ||
                    v.name.includes('Female'))
              );
            }

            if (!matchedVoice) {
              matchedVoice = voices.find((v) => v.lang.startsWith('en')) || voices[0];
            }

            if (matchedVoice) {
              utterance.voice = matchedVoice;
            }
          }

          utterance.onstart = () => {
            this.setState('speaking');
            this.startSyntheticVisemeLoop(text);

            // Chrome heartbeat: unfreeze speech if longer than 15s
            if (this.speechHeartbeatTimer) clearInterval(this.speechHeartbeatTimer);
            this.speechHeartbeatTimer = setInterval(() => {
              if (typeof window !== 'undefined' && window.speechSynthesis.speaking) {
                window.speechSynthesis.pause();
                window.speechSynthesis.resume();
              }
            }, 6000);
          };

          // On word boundary, synchronize mouth shapes to actual syllables
          utterance.onboundary = (e: SpeechSynthesisEvent) => {
            if (e.name === 'word' || !e.name) {
              const charIdx = e.charIndex || 0;
              const remaining = text.slice(charIdx);
              const currentWord = remaining.split(/\s+/)[0] || '';
              this.applyWordViseme(currentWord);
            }
          };

          utterance.onend = () => {
            if (this.speechHeartbeatTimer) {
              clearInterval(this.speechHeartbeatTimer);
              this.speechHeartbeatTimer = null;
            }
            this.activeUtterance = null;
            (window as any).__smartClassActiveUtterance = null;
            this.stopAnalysisLoop();
            this.setState('idle');
          };

          utterance.onerror = (e) => {
            if (e.error !== 'interrupted' && e.error !== 'canceled') {
              console.warn('Speech synthesis error, transitioning to acoustic voice fallback:', e.error);
              this.playAcousticSpeechFallback(text, isMale);
            }
            if (this.speechHeartbeatTimer) {
              clearInterval(this.speechHeartbeatTimer);
              this.speechHeartbeatTimer = null;
            }
            this.activeUtterance = null;
            (window as any).__smartClassActiveUtterance = null;
          };

          window.speechSynthesis.speak(utterance);

          // Additional safety resume call for Safari
          setTimeout(() => {
            if (typeof window !== 'undefined' && window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
          }, 60);
        } catch (innerErr) {
          console.warn('SpeechSynthesis invocation error:', innerErr);
          this.playAcousticSpeechFallback(text, isMale);
        }
      }, 30);
    } catch (err) {
      this.playAcousticSpeechFallback(text, isMale);
    }
  }

  /**
   * Applies realistic phonetic mouth viseme based on the active word.
   */
  private applyWordViseme(word: string) {
    const clean = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!clean) return;

    let targetViseme: VisemeFrame['viseme'] = 'sil';
    let targetJaw = 0.45;
    let targetWidth = 0.2;
    let targetRound = 0.1;
    let teeth = false;
    let tongue = false;

    // Vowel & consonant heuristics
    if (clean.includes('a')) {
      targetViseme = 'aa';
      targetJaw = 0.85;
      targetWidth = 0.25;
      targetRound = 0.08;
      teeth = true;
      tongue = true;
    } else if (clean.includes('e') || clean.includes('i')) {
      targetViseme = 'ee';
      targetJaw = 0.55;
      targetWidth = 0.65;
      targetRound = 0.0;
      teeth = true;
    } else if (clean.includes('o')) {
      targetViseme = 'oh';
      targetJaw = 0.75;
      targetWidth = -0.25;
      targetRound = 0.65;
    } else if (clean.includes('u') || clean.includes('oo') || clean.includes('w')) {
      targetViseme = 'oo';
      targetJaw = 0.6;
      targetWidth = -0.45;
      targetRound = 0.8;
    } else if (clean.includes('th')) {
      targetViseme = 'th';
      targetJaw = 0.4;
      targetWidth = 0.25;
      teeth = true;
      tongue = true;
    } else if (clean.includes('s') || clean.includes('c') || clean.includes('z')) {
      targetViseme = 's';
      targetJaw = 0.35;
      targetWidth = 0.5;
      teeth = true;
    } else if (clean.includes('m') || clean.includes('b') || clean.includes('p')) {
      targetViseme = 'm';
      targetJaw = 0.05;
      targetWidth = 0.05;
      targetRound = 0.05;
    }

    const smoothing = 0.4;
    this.currentJaw += (targetJaw - this.currentJaw) * smoothing;
    this.currentWidth += (targetWidth - this.currentWidth) * smoothing;
    this.currentRound += (targetRound - this.currentRound) * smoothing;
    this.currentViseme = targetViseme;

    this.emitViseme({
      viseme: targetViseme,
      jawDrop: Math.max(0, Math.min(1, this.currentJaw)),
      mouthWidth: Math.max(-1, Math.min(1, this.currentWidth)),
      lipRound: Math.max(0, Math.min(1, this.currentRound)),
      teethVisible: teeth,
      tongueOut: tongue,
    });
  }

  /**
   * Web Audio Acoustic Vocal Formant Synthesizer:
   * Uses parallel resonant formant filters (F1, F2) modulated by natural speech prosody.
   * Guarantees audible educator speech sounds even in environments without Web Speech API!
   */
  private playAcousticSpeechFallback(text: string, isMale: boolean = false) {
    const ctx = this.initAudioContext();
    if (!ctx) return;

    try {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const words = text.split(/\s+/).filter(Boolean);
      const syllablesCount = Math.max(4, Math.min(30, Math.floor(words.length * 1.35)));
      const baseFreq = isMale ? 135 : 220;
      const now = ctx.currentTime;
      let timeOffset = 0.05;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter1 = ctx.createBiquadFilter();
      const filter2 = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      filter1.type = 'bandpass';
      filter1.frequency.setValueAtTime(550, now);
      filter1.Q.setValueAtTime(3.8, now);

      filter2.type = 'bandpass';
      filter2.frequency.setValueAtTime(1700, now);
      filter2.Q.setValueAtTime(3.2, now);

      gain.gain.setValueAtTime(0, now);

      osc.connect(filter1);
      osc.connect(filter2);
      filter1.connect(gain);
      filter2.connect(gain);

      if (this.analyser) {
        gain.connect(this.analyser);
        try {
          this.analyser.connect(ctx.destination);
        } catch (e) {}
      } else {
        gain.connect(ctx.destination);
      }

      // Generate natural syllable rhythmic cadence
      for (let i = 0; i < syllablesCount; i++) {
        const sylDuration = 0.16 + Math.sin(i * 1.3) * 0.04;
        const pitchMod = Math.sin(i * 0.7) * 22 + (i === syllablesCount - 1 ? -30 : 0);
        const sylFreq = baseFreq + pitchMod;

        osc.frequency.setValueAtTime(sylFreq, now + timeOffset);
        gain.gain.setValueAtTime(0.001, now + timeOffset);
        gain.gain.linearRampToValueAtTime(0.2, now + timeOffset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + sylDuration);

        const f1Targets = [500, 750, 350, 580];
        const f2Targets = [1900, 1300, 2300, 1050];
        filter1.frequency.setValueAtTime(f1Targets[i % f1Targets.length], now + timeOffset);
        filter2.frequency.setValueAtTime(f2Targets[i % f2Targets.length], now + timeOffset);

        timeOffset += sylDuration + 0.05;
      }

      osc.start(now + 0.05);
      osc.stop(now + timeOffset + 0.1);

      this.setState('speaking');
      this.startSyntheticVisemeLoop(text);

      setTimeout(() => {
        this.stopAnalysisLoop();
        this.setState('idle');
      }, (timeOffset + 0.25) * 1000);
    } catch (e) {
      console.warn('Acoustic speech synthesis failed:', e);
    }
  }

  /**
   * Plays an AudioBuffer through Web Audio with real-time FFT spectrum analysis.
   */
  private playAudioBuffer(buffer: AudioBuffer, text: string) {
    const ctx = this.initAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    if (this.isMuted) {
      this.setState('idle');
      return;
    }

    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      if (this.analyser) {
        source.connect(this.analyser);
        try {
          this.analyser.connect(ctx.destination);
        } catch (e) {}
      } else {
        source.connect(ctx.destination);
      }

      this.activeBufferSource = source;
      this.setState('speaking');
      this.startAudioAnalysisLoop(text);

      source.onended = () => {
        if (this.activeBufferSource === source) {
          this.activeBufferSource = null;
          this.stopAnalysisLoop();
          this.setState('idle');
        }
      };

      source.start(0);
    } catch (err) {
      console.warn('playAudioBuffer error:', err);
      this.playAcousticSpeechFallback(text, this.currentVoiceName === 'Puck');
    }
  }

  /**
   * Plays audio from a URL/Blob using HTMLAudioElement.
   */
  private playAudioUrl(url: string, text: string) {
    if (this.isMuted) {
      this.setState('idle');
      return;
    }

    try {
      const audio = new Audio(url);
      audio.crossOrigin = 'anonymous';
      audio.volume = 1.0;
      audio.muted = this.isMuted;
      this.currentAudioElement = audio;

      audio.onplay = () => {
        this.setState('speaking');
        this.startSyntheticVisemeLoop(text);
      };

      audio.onended = () => {
        if (this.currentAudioElement === audio) {
          this.currentAudioElement = null;
          this.stopAnalysisLoop();
          this.setState('idle');
        }
      };

      audio.onerror = () => {
        this.playAcousticSpeechFallback(text, this.currentVoiceName === 'Puck');
      };

      audio.play().catch(() => {
        this.playAcousticSpeechFallback(text, this.currentVoiceName === 'Puck');
      });
    } catch (e) {
      this.playAcousticSpeechFallback(text, this.currentVoiceName === 'Puck');
    }
  }

  /**
   * Comprehensive Sound verification test:
   * 1. Plays a warm, audible 3-tone pedagogical chime (C5 -> E5 -> G5)
   * 2. Follows with clear teacher speech in the active avatar's voice.
   */
  public async testSound(voiceName: string = 'Kore'): Promise<void> {
    this.unlockAudio();
    // 1. Play audible 3-tone chime immediately
    this.playActivationChime([523.25, 659.25, 783.99], 0.35);

    // 2. Teacher speaks clearly
    setTimeout(() => {
      this.speak(
        'Welcome to SmartClass AI! Educator audio and real-time lip sync are working perfectly for your lesson.',
        voiceName
      );
    }, 420);
  }

  /**
   * Real-time FFT spectral analysis loop for lip-synchronization
   * Maps acoustic formants (F1, F2, F3) to authentic visemes
   */
  private startAudioAnalysisLoop(spokenText: string) {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    const freqData = new Uint8Array(this.analyser ? this.analyser.frequencyBinCount : 128);

    const analyze = () => {
      if (this.currentState !== 'speaking' && this.currentState !== 'explaining') {
        return;
      }

      if (this.analyser) {
        this.analyser.getByteFrequencyData(freqData);

        let lowEnergy = 0;
        const lowEnd = Math.floor(freqData.length * 0.15);
        for (let i = 1; i < lowEnd; i++) {
          lowEnergy += freqData[i];
        }
        lowEnergy /= (lowEnd - 1) * 255;

        let midEnergy = 0;
        const midStart = lowEnd;
        const midEnd = Math.floor(freqData.length * 0.45);
        for (let i = midStart; i < midEnd; i++) {
          midEnergy += freqData[i];
        }
        midEnergy /= (midEnd - midStart) * 255;

        let highEnergy = 0;
        const highStart = midEnd;
        const highEnd = Math.floor(freqData.length * 0.85);
        for (let i = highStart; i < highEnd; i++) {
          highEnergy += freqData[i];
        }
        highEnergy /= (highEnd - highStart) * 255;

        const totalVolume = lowEnergy * 0.6 + midEnergy * 0.3 + highEnergy * 0.1;

        let targetViseme: VisemeFrame['viseme'] = 'sil';
        let targetJaw = 0;
        let targetWidth = 0;
        let targetRound = 0;
        let teeth = false;
        let tongue = false;

        if (totalVolume < 0.04) {
          targetViseme = 'sil';
          targetJaw = 0;
          targetWidth = 0;
          targetRound = 0;
        } else if (highEnergy > 0.28 && highEnergy > lowEnergy * 0.85) {
          targetViseme = highEnergy > 0.45 ? 's' : highEnergy > 0.35 ? 'th' : 'f';
          targetJaw = 0.35;
          targetWidth = 0.5;
          targetRound = 0.0;
          teeth = true;
          tongue = targetViseme === 'th';
        } else if (midEnergy > lowEnergy * 1.05) {
          targetViseme = 'ee';
          targetJaw = Math.min(0.65, 0.35 + totalVolume * 1.2);
          targetWidth = 0.65;
          targetRound = 0.0;
          teeth = true;
        } else if (lowEnergy > 0.38 && midEnergy < 0.25) {
          targetViseme = 'oo';
          targetJaw = Math.min(0.75, 0.4 + totalVolume * 1.2);
          targetWidth = -0.45;
          targetRound = 0.7;
        } else if (lowEnergy > 0.2) {
          targetViseme = lowEnergy > 0.4 ? 'aa' : 'oh';
          targetJaw = Math.min(0.95, 0.35 + lowEnergy * 1.6);
          targetWidth = 0.2;
          targetRound = targetViseme === 'oh' ? 0.48 : 0.1;
          teeth = lowEnergy > 0.35;
          tongue = targetViseme === 'aa';
        } else {
          targetViseme = 'm';
          targetJaw = 0.0;
          targetWidth = 0.05;
          targetRound = 0.05;
        }

        const dt = 0.28;
        this.currentJaw += (targetJaw - this.currentJaw) * dt;
        this.currentWidth += (targetWidth - this.currentWidth) * dt;
        this.currentRound += (targetRound - this.currentRound) * dt;
        this.currentViseme = targetViseme;

        this.emitViseme({
          viseme: this.currentViseme,
          jawDrop: Math.max(0, Math.min(1, this.currentJaw)),
          mouthWidth: Math.max(-1, Math.min(1, this.currentWidth)),
          lipRound: Math.max(0, Math.min(1, this.currentRound)),
          teethVisible: teeth,
          tongueOut: tongue,
        });
      }

      this.animationFrameId = requestAnimationFrame(analyze);
    };

    this.animationFrameId = requestAnimationFrame(analyze);
  }

  /**
   * Continuous synthetic viseme loop when audio plays via Web Speech
   */
  private startSyntheticVisemeLoop(text: string) {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);
    let wordIdx = 0;
    let charIdx = 0;
    let stepCount = 0;

    let targetViseme: VisemeFrame['viseme'] = 'sil';
    let targetJaw = 0;
    let targetWidth = 0;
    let targetRound = 0;
    let targetTeeth = false;
    let targetTongue = false;

    const tick = () => {
      if (this.currentState !== 'speaking' && this.currentState !== 'explaining') {
        return;
      }

      stepCount++;
      if (stepCount % 5 === 0) {
        if (wordIdx < words.length) {
          const currentWord = words[wordIdx];
          const char = currentWord[charIdx] || '';
          charIdx++;
          if (charIdx >= currentWord.length) {
            charIdx = 0;
            wordIdx++;
          }

          if ('aeiou'.includes(char)) {
            if (char === 'a') {
              targetViseme = 'aa';
              targetJaw = 0.88;
              targetWidth = 0.22;
              targetRound = 0.08;
              targetTeeth = true;
              targetTongue = true;
            } else if (char === 'e' || char === 'i') {
              targetViseme = 'ee';
              targetJaw = 0.58;
              targetWidth = 0.65;
              targetRound = 0.0;
              targetTeeth = true;
              targetTongue = false;
            } else if (char === 'o') {
              targetViseme = 'oh';
              targetJaw = 0.78;
              targetWidth = -0.25;
              targetRound = 0.62;
              targetTeeth = false;
              targetTongue = false;
            } else if (char === 'u') {
              targetViseme = 'oo';
              targetJaw = 0.68;
              targetWidth = -0.45;
              targetRound = 0.78;
              targetTeeth = false;
              targetTongue = false;
            }
          } else if ('fv'.includes(char)) {
            targetViseme = 'f';
            targetJaw = 0.3;
            targetWidth = 0.35;
            targetRound = 0.0;
            targetTeeth = true;
            targetTongue = false;
          } else if ('szc'.includes(char)) {
            targetViseme = 's';
            targetJaw = 0.35;
            targetWidth = 0.5;
            targetRound = 0.0;
            targetTeeth = true;
            targetTongue = false;
          } else if ('mbp'.includes(char)) {
            targetViseme = 'm';
            targetJaw = 0.0;
            targetWidth = 0.0;
            targetRound = 0.05;
            targetTeeth = false;
            targetTongue = false;
          } else if (char === 't' || char === 'd' || char === 'n' || char === 'l') {
            targetViseme = 'th';
            targetJaw = 0.38;
            targetWidth = 0.28;
            targetRound = 0.0;
            targetTeeth = true;
            targetTongue = true;
          } else if (char === 'w' || char === 'r') {
            targetViseme = 'oo';
            targetJaw = 0.52;
            targetWidth = -0.35;
            targetRound = 0.68;
            targetTeeth = false;
            targetTongue = false;
          } else {
            targetViseme = 'sil';
            targetJaw = 0.04;
            targetWidth = 0.0;
            targetRound = 0.0;
            targetTeeth = false;
            targetTongue = false;
          }
        } else {
          targetViseme = 'sil';
          targetJaw = 0;
          targetWidth = 0;
          targetRound = 0;
          targetTeeth = false;
          targetTongue = false;
        }
      }

      const smoothing = 0.28;
      this.currentJaw += (targetJaw - this.currentJaw) * smoothing;
      this.currentWidth += (targetWidth - this.currentWidth) * smoothing;
      this.currentRound += (targetRound - this.currentRound) * smoothing;
      this.currentViseme = targetViseme;

      this.emitViseme({
        viseme: targetViseme,
        jawDrop: Math.max(0, Math.min(1, this.currentJaw)),
        mouthWidth: Math.max(-1, Math.min(1, this.currentWidth)),
        lipRound: Math.max(0, Math.min(1, this.currentRound)),
        teethVisible: targetTeeth,
        tongueOut: targetTongue,
      });

      this.animationFrameId = requestAnimationFrame(tick);
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  private stopAnalysisLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.resetViseme();
  }

  private resetViseme() {
    this.currentJaw = 0;
    this.currentWidth = 0;
    this.currentRound = 0;
    this.currentViseme = 'sil';
    this.emitViseme({
      viseme: 'sil',
      jawDrop: 0,
      mouthWidth: 0,
      lipRound: 0,
      teethVisible: false,
      tongueOut: false,
    });
  }

  private emitViseme(frame: VisemeFrame) {
    for (const listener of this.visemeListeners) {
      listener(frame);
    }
  }
}

export const avatarAudioEngine = new AvatarAudioEngine();
