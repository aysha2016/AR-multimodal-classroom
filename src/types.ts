export type SubjectType = 'Science' | 'Mathematics' | 'English' | 'Arabic' | 'ICT';

export type NavigationPage =
  | 'home'
  | 'classroom'
  | 'lessons'
  | 'subjects'
  | 'tutor'
  | 'arlab'
  | 'quizzes'
  | 'progress'
  | 'certificates'
  | 'settings'
  | 'teacher';

export type TeacherState = 'idle' | 'speaking' | 'explaining' | 'listening' | 'thinking' | 'loading' | 'error';

export interface InteractiveLabel {
  id: string;
  name: string;
  position: [number, number, number]; // 3D coordinates
  cameraPosition?: [number, number, number];
  shortExplanation: string;
  detailedExplanation: string;
  scienceFormula?: string;
  accentColor: string;
  category: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Lesson {
  id: string;
  title: string;
  subject: SubjectType;
  grade: number;
  durationMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  learningOutcomes: string[];
  sceneType: 'water-cycle' | 'heart' | 'solar-system' | 'plant-cell' | 'volcano' | 'circuit';
  labels: InteractiveLabel[];
  quiz: QuizQuestion[];
  diagramSvgPath?: string;
  coverImage: string;
  teacherInitialPrompt: string;
}

export interface TeacherAvatarConfig {
  id: string;
  name: string;
  title: string;
  role: string;
  gender: 'female' | 'male';
  voiceName: string; // Gemini TTS voice: 'Kore' (female), 'Puck' (male)
  bio: string;
  specialty: string;
  avatarImage: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  highlightedElement?: string;
  audioUrl?: string;
  isAudioPlaying?: boolean;
}

export interface StudentProfile {
  name: string;
  email: string;
  grade: number;
  role: 'student' | 'teacher';
  avatar: string;
  streakDays: number;
  completedLessons: string[];
  inProgressLessons: string[];
  quizScores: { [lessonId: string]: number };
  certificates: {
    id: string;
    title: string;
    lessonTitle: string;
    score: number;
    date: string;
    badgeIcon: string;
  }[];
  language: 'en' | 'ar';
}

export interface VisemeFrame {
  viseme: 'sil' | 'aa' | 'ee' | 'oo' | 'oh' | 'f' | 'th' | 'm' | 's';
  jawDrop: number;      // 0 to 1
  mouthWidth: number;   // -1 to 1 (-1 narrow/puckered, 1 stretched smile)
  lipRound: number;     // 0 to 1
  teethVisible: boolean;
  tongueOut: boolean;
}
