import React, { useState, useEffect } from 'react';
import {
  Lesson,
  InteractiveLabel,
  TeacherAvatarConfig,
  ChatMessage,
  StudentProfile,
  SubjectType,
  NavigationPage,
  QuizQuestion,
} from './types';
import { LESSONS_DATA, TEACHER_AVATARS } from './data/lessons';
import { avatarAudioEngine } from './services/avatarAudioEngine';
import { Sidebar } from './components/navigation/Sidebar';
import { TopNavBar } from './components/navigation/TopNavBar';
import { PrototypeExactClassroom, ClassroomViewMode } from './components/prototype/PrototypeExactClassroom';
import { PrototypeResourceCards } from './components/prototype/PrototypeResourceCards';
import { PrototypeAITutorPanel } from './components/prototype/PrototypeAITutorPanel';
import { PrototypeProgressCard } from './components/prototype/PrototypeProgressCard';
import { AdaptiveQuizModal } from './components/quiz/AdaptiveQuizModal';
import { PersonalizedProgressView } from './components/dashboard/PersonalizedProgressView';
import { TeacherDashboardView } from './components/teacher/TeacherDashboardView';
import { SubjectsLessonsView } from './components/views/SubjectsLessonsView';
import { ARLabView } from './components/views/ARLabView';
import { CertificatesView } from './components/views/CertificatesView';
import { SettingsView } from './components/views/SettingsView';
import { PhotorealisticTeacherAvatar } from './components/avatar/PhotorealisticTeacherAvatar';
import { AITutorPanel } from './components/classroom/AITutorPanel';
import { FileQuestion } from 'lucide-react';

export default function App() {
  // Navigation & View state
  const [currentPage, setCurrentPage] = useState<NavigationPage>('home');
  const [activeSubject, setActiveSubject] = useState<SubjectType>('Science');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Lesson state: Default is "The Water Cycle — Grade 8 Science"
  const [currentLesson, setCurrentLesson] = useState<Lesson>(LESSONS_DATA[0]);
  const [activeLabel, setActiveLabel] = useState<InteractiveLabel | null>(null);

  // Teacher Avatar state
  const [currentTeacher, setCurrentTeacher] = useState<TeacherAvatarConfig>(TEACHER_AVATARS[0]);
  const [isPlayingNarration, setIsPlayingNarration] = useState<boolean>(true);
  const [classroomViewMode, setClassroomViewMode] = useState<ClassroomViewMode>('normal');

  // AI Tutor Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'tutor',
      text: LESSONS_DATA[0].teacherInitialPrompt,
      timestamp: '10:00 AM',
    },
  ]);
  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);

  // Quiz Modal state
  const [isQuizModalOpen, setIsQuizModalOpen] = useState<boolean>(false);

  // Student Profile state
  const [studentProfile, setStudentProfile] = useState<StudentProfile>({
    name: 'Student',
    email: 'student@smartclass.ai',
    grade: 8,
    role: 'student',
    avatar: './assets/prototype/student-avatar.png',
    streakDays: 8,
    completedLessons: ['water-cycle'],
    inProgressLessons: ['human-heart', 'solar-system'],
    quizScores: {
      'water-cycle': 90,
      'solar-system': 85,
    },
    certificates: [
      {
        id: 'c1',
        title: 'Hydrological Systems Mastery',
        lessonTitle: 'The Water Cycle: Earth Hydrological System',
        score: 90,
        date: 'October 2026',
        badgeIcon: '🌊',
      },
    ],
    language: 'en',
  });

  // Kickoff initial educator speech narration on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isPlayingNarration) {
        avatarAudioEngine.speak(LESSONS_DATA[0].teacherInitialPrompt, TEACHER_AVATARS[0].voiceName);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // Change lesson
  const handleSelectLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setActiveLabel(null);
    setCurrentPage('home');

    if (isPlayingNarration) {
      avatarAudioEngine.speak(lesson.teacherInitialPrompt, currentTeacher.voiceName);
    }
  };

  // Select lesson by ID (from resource cards)
  const handleSelectLessonById = (lessonId: string) => {
    const found = LESSONS_DATA.find((l) => l.id === lessonId);
    if (found) {
      handleSelectLesson(found);
    }
  };

  // When student clicks an interactive 3D label
  const handleSelectLabel = (label: InteractiveLabel) => {
    setActiveLabel(label);
    // Trigger pointing animation on the educator avatar toward this 3D label
    avatarAudioEngine.triggerGesture('point', label.name, 4500, 'label');

    const labelExplanationText = `${label.name}: ${label.shortExplanation} ${label.detailedExplanation}`;
    if (isPlayingNarration) {
      avatarAudioEngine.speak(labelExplanationText, currentTeacher.voiceName);
    }
  };

  // When student clicks "Ask AI Tutor About This" on a label
  const handleAskTutorAboutLabel = (label: InteractiveLabel) => {
    handleSendMessage(`Can you explain ${label.name} in more detail and why it matters in ${currentLesson.title}?`);
  };

  // Send message to AI Tutor (Gemini API pipeline via /api/chat)
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoadingChat(true);

    // Trigger thoughtful pondering gesture while AI is analyzing question
    avatarAudioEngine.triggerGesture('think', undefined, 2500, 'question');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          lessonTitle: currentLesson.title,
          subject: currentLesson.subject,
          grade: studentProfile.grade,
          teacherName: currentTeacher.name,
          history: messages.slice(-4),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.text || 'I understand. Let us review the key principles together.';

        const tutorMsg: ChatMessage = {
          id: `tutor-${Date.now()}`,
          sender: 'tutor',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, tutorMsg]);

        // Trigger affirmative nodding animation when answering student question!
        avatarAudioEngine.triggerGesture('nod', undefined, 3500, 'question');

        if (isPlayingNarration) {
          avatarAudioEngine.speak(replyText, currentTeacher.voiceName);
        }
      } else {
        throw new Error('Chat API returned error');
      }
    } catch {
      const fallbackReply = `That is an insightful question about ${currentLesson.title}! In Grade ${studentProfile.grade} Science, notice how thermal energy balances the entire system. Click on the 3D labels or try a quick quiz to test your comprehension.`;

      const tutorMsg: ChatMessage = {
        id: `tutor-fb-${Date.now()}`,
        sender: 'tutor',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, tutorMsg]);

      // Trigger affirmative nodding animation on answer
      avatarAudioEngine.triggerGesture('nod', undefined, 3500, 'question');

      if (isPlayingNarration) {
        avatarAudioEngine.speak(fallbackReply, currentTeacher.voiceName);
      }
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Toggle narration voice
  const handleToggleNarration = () => {
    const next = !isPlayingNarration;
    setIsPlayingNarration(next);
    avatarAudioEngine.setMuted(!next);
    if (!next) {
      avatarAudioEngine.stop();
    } else {
      avatarAudioEngine.unlockAudio();
      avatarAudioEngine.speak(currentLesson.teacherInitialPrompt, currentTeacher.voiceName);
    }
  };

  // Switch educator avatar (Sarah / Marcus)
  const handleSwitchTeacher = (teacher: TeacherAvatarConfig) => {
    setCurrentTeacher(teacher);
    avatarAudioEngine.speak(
      `Hello, I am ${teacher.name}. I am excited to guide your learning today!`,
      teacher.voiceName
    );
  };

  // Quiz completion handler
  const handleCompleteQuiz = (lessonId: string, scorePercentage: number) => {
    setStudentProfile((prev) => {
      const updatedScores = { ...prev.quizScores, [lessonId]: scorePercentage };
      const completed = prev.completedLessons.includes(lessonId)
        ? prev.completedLessons
        : [...prev.completedLessons, lessonId];

      const newCertificates = [...prev.certificates];
      if (scorePercentage >= 80 && !newCertificates.some((c) => c.lessonTitle === currentLesson.title)) {
        newCertificates.push({
          id: `cert-${Date.now()}`,
          title: `${currentLesson.title} Honors`,
          lessonTitle: currentLesson.title,
          score: scorePercentage,
          date: 'October 2026',
          badgeIcon: '🏅',
        });
      }

      return {
        ...prev,
        quizScores: updatedScores,
        completedLessons: completed,
        certificates: newCertificates,
      };
    });
  };

  // Ask tutor to explain mistake from quiz
  const handleAskTutorForQuizMistake = (q: QuizQuestion, selectedOption: string) => {
    setIsQuizModalOpen(false);
    handleSendMessage(
      `I answered "${selectedOption}" to the question: "${q.question}". Can you explain why that is a misconception without giving away the full answer right away?`
    );
  };

  // Global search trigger
  const handleSearchSubmit = (query: string) => {
    const matched = LESSONS_DATA.find(
      (l) =>
        l.title.toLowerCase().includes(query.toLowerCase()) ||
        l.description.toLowerCase().includes(query.toLowerCase())
    );
    if (matched) {
      handleSelectLesson(matched);
    } else {
      setCurrentPage('home');
      handleSendMessage(query);
    }
  };

  // Subject tabs configuration matching exact prototype
  const subjects: SubjectType[] = ['Science', 'Mathematics', 'English', 'Arabic', 'ICT'];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f4f7fc] text-slate-800 font-sans antialiased">
      {/* Dark Navy Vertical Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          setIsMobileMenuOpen(false);
        }}
        isTeacherMode={studentProfile.role === 'teacher'}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navigation Bar */}
        <TopNavBar
          profile={studentProfile}
          onChangeGrade={(grade) => setStudentProfile((p) => ({ ...p, grade }))}
          onToggleRole={() =>
            setStudentProfile((p) => ({
              ...p,
              role: p.role === 'student' ? 'teacher' : 'student',
            }))
          }
          onChangeLanguage={(lang) => setStudentProfile((p) => ({ ...p, language: lang }))}
          onSearchSubmit={handleSearchSubmit}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          {/* VIEW 1: EXACT PROTOTYPE CLASSROOM (Home & Live Class) */}
          {(currentPage === 'home' || currentPage === 'classroom') && (
            <div className="max-w-[1600px] mx-auto space-y-4">
              {/* Subject Tabs Row matching prototype */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {subjects.map((sub) => {
                  const isActive = activeSubject === sub;
                  return (
                    <button
                      key={sub}
                      onClick={() => {
                        setActiveSubject(sub);
                        if (sub !== 'Science') {
                          setCurrentPage('subjects');
                        } else {
                          const waterLesson = LESSONS_DATA.find((l) => l.id === 'water-cycle');
                          if (waterLesson) handleSelectLesson(waterLesson);
                        }
                      }}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-[#2563eb] text-white shadow-sm'
                          : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>

              {/* Main Content Grid: Left Column (Classroom + Resource Cards), Right Column (AI Tutor + My Progress) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Left Column (8 cols in 12-col grid = ~67%) */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Exact Interactive Classroom Component */}
                  <PrototypeExactClassroom
                    lesson={currentLesson}
                    activeLabel={activeLabel}
                    onSelectLabel={handleSelectLabel}
                    onAskTutorAboutLabel={handleAskTutorAboutLabel}
                    onOpenARView={() => setCurrentPage('arlab')}
                    isPlayingNarration={isPlayingNarration}
                    onToggleNarration={handleToggleNarration}
                    currentTeacher={currentTeacher}
                    viewMode={classroomViewMode}
                    onViewModeChange={setClassroomViewMode}
                  />

                  {/* Exact Resource Cards Component */}
                  <PrototypeResourceCards
                    currentLessonId={currentLesson.id}
                    onSelectLesson={handleSelectLessonById}
                    onSelectDiagram={(lessonId) => {
                      if (lessonId) handleSelectLessonById(lessonId);
                      setClassroomViewMode('diagram');
                    }}
                    onSelectCategory={(cat) => {
                      if (cat === 'Diagrams') {
                        setClassroomViewMode('diagram');
                      } else if (cat === 'Videos') {
                        setClassroomViewMode('normal');
                      } else if (cat === 'Interactive Simulations' || cat === '3D Models') {
                        setClassroomViewMode('simulation');
                      }
                    }}
                  />
                </div>

                {/* Right Column (4 cols in 12-col grid = ~33%) */}
                <div className="lg:col-span-4 space-y-4">
                  {/* Exact AI Tutor Panel Component */}
                  <PrototypeAITutorPanel
                    lesson={currentLesson}
                    onOpenQuiz={() => setIsQuizModalOpen(true)}
                    onHighlightLabel={handleSelectLabel}
                  />

                  {/* Exact My Progress Card Component */}
                  <PrototypeProgressCard
                    onViewAll={() => setCurrentPage('progress')}
                    onSelectTopic={(topic) => {
                      if (topic === 'The Water Cycle') {
                        const waterLesson = LESSONS_DATA.find((l) => l.id === 'water-cycle');
                        if (waterLesson) handleSelectLesson(waterLesson);
                      } else if (topic === 'Rock Types') {
                        const volcanoLesson = LESSONS_DATA.find((l) => l.id === 'volcano');
                        if (volcanoLesson) handleSelectLesson(volcanoLesson);
                      } else if (topic === 'Energy and Forces') {
                        const circuitLesson = LESSONS_DATA.find((l) => l.id === 'electric-circuit');
                        if (circuitLesson) handleSelectLesson(circuitLesson);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: My Lessons & Subjects Catalog */}
          {(currentPage === 'lessons' || currentPage === 'subjects') && (
            <div className="max-w-7xl mx-auto">
              <SubjectsLessonsView
                lessons={LESSONS_DATA}
                activeSubject={activeSubject}
                onSelectSubject={setActiveSubject}
                onLaunchLesson={handleSelectLesson}
                completedLessonIds={studentProfile.completedLessons}
              />
            </div>
          )}

          {/* VIEW 3: Dedicated AI Tutor Voice Sandbox */}
          {currentPage === 'tutor' && (
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 h-[600px]">
              <PhotorealisticTeacherAvatar
                currentTeacher={currentTeacher}
                onSwitchTeacher={handleSwitchTeacher}
                availableTeachers={TEACHER_AVATARS}
                highlightedElement={activeLabel?.name}
              />
              <AITutorPanel
                currentTeacher={currentTeacher}
                lesson={currentLesson}
                messages={messages}
                onSendMessage={handleSendMessage}
                onClearMessages={() =>
                  setMessages([
                    {
                      id: `reset-${Date.now()}`,
                      sender: 'tutor',
                      text: currentLesson.teacherInitialPrompt,
                      timestamp: '10:00 AM',
                    },
                  ])
                }
                onOpenQuiz={() => setIsQuizModalOpen(true)}
                onHighlightLabel={handleSelectLabel}
                isLoading={isLoadingChat}
              />
            </div>
          )}

          {/* VIEW 4: Augmented Reality (AR) Lab */}
          {currentPage === 'arlab' && (
            <div className="max-w-7xl mx-auto">
              <ARLabView
                lessons={LESSONS_DATA}
                onOpenClassroomWithLesson={handleSelectLesson}
              />
            </div>
          )}

          {/* VIEW 5: Quizzes Hub */}
          {currentPage === 'quizzes' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileQuestion className="w-5 h-5 text-blue-600" />
                  Adaptive Concept Evaluations
                </h3>
                <p className="text-xs text-slate-600">
                  Assessments test your ability to connect 3D visual models with physical and scientific laws.
                </p>
                <button
                  onClick={() => setIsQuizModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Start Assessment for {currentLesson.title}
                </button>
              </div>

              {/* Grid of other lesson quizzes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {LESSONS_DATA.map((l) => (
                  <div
                    key={l.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{l.title}</h4>
                      <span className="text-[11px] text-slate-500">{l.quiz.length} Questions • {l.difficulty}</span>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentLesson(l);
                        setIsQuizModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-xs font-semibold text-blue-600 transition-colors"
                    >
                      Start
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 6: Personalized Progress */}
          {currentPage === 'progress' && (
            <div className="max-w-7xl mx-auto">
              <PersonalizedProgressView
                profile={studentProfile}
                lessons={LESSONS_DATA}
                onOpenLesson={(lessonId) => {
                  const target = LESSONS_DATA.find((l) => l.id === lessonId);
                  if (target) handleSelectLesson(target);
                }}
              />
            </div>
          )}

          {/* VIEW 7: Certificates */}
          {currentPage === 'certificates' && (
            <div className="max-w-7xl mx-auto">
              <CertificatesView profile={studentProfile} />
            </div>
          )}

          {/* VIEW 8: Settings */}
          {currentPage === 'settings' && (
            <div className="max-w-7xl mx-auto">
              <SettingsView
                currentTeacher={currentTeacher}
                availableTeachers={TEACHER_AVATARS}
                onSelectTeacher={handleSwitchTeacher}
              />
            </div>
          )}

          {/* VIEW 9: Teacher Portal */}
          {currentPage === 'teacher' && (
            <div className="max-w-7xl mx-auto">
              <TeacherDashboardView
                lessons={LESSONS_DATA}
                onAddNewQuestionToLesson={(lessonId, question) => {
                  const target = LESSONS_DATA.find((l) => l.id === lessonId);
                  if (target) target.quiz.push(question);
                }}
                onAssignLessonToClass={(lessonTitle, dueDate) => {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `assign-${Date.now()}`,
                      sender: 'tutor',
                      text: `📢 Announcement: The lesson "${lessonTitle}" has been assigned to your class. Due date: ${dueDate}.`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ]);
                }}
              />
            </div>
          )}
        </main>
      </div>

      {/* Adaptive Quiz Modal Overlay */}
      <AdaptiveQuizModal
        lesson={currentLesson}
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        onCompleteQuiz={handleCompleteQuiz}
        onAskTutorForHelp={handleAskTutorForQuizMistake}
      />
    </div>
  );
}
