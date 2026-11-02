import React from 'react';
import { StudentProfile, Lesson, SubjectType } from '../../types';
import {
  TrendingUp,
  Award,
  BookCheck,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Target,
  BarChart3,
} from 'lucide-react';

interface PersonalizedProgressViewProps {
  profile: StudentProfile;
  lessons: Lesson[];
  onOpenLesson: (lessonId: string) => void;
}

export const PersonalizedProgressView: React.FC<PersonalizedProgressViewProps> = ({
  profile,
  lessons,
  onOpenLesson,
}) => {
  // Compute overall statistics
  const totalLessonsCount = lessons.length;
  const completedCount = profile.completedLessons.length;
  const overallPercentage = Math.round((completedCount / totalLessonsCount) * 100);

  // Subject breakups
  const subjects: SubjectType[] = ['Science', 'Mathematics', 'English', 'Arabic', 'ICT'];

  // Calculate scores average
  const scoreValues = Object.values(profile.quizScores);
  const avgScore =
    scoreValues.length > 0
      ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
      : 85;

  // Determine adaptive recommendation
  const waterCycleScore = profile.quizScores['water-cycle'] ?? 85;
  let recommendedLesson = lessons[0];
  let recommendationNote = 'Advance to higher-order systems modeling.';

  if (waterCycleScore < 50) {
    recommendedLesson = lessons[0]; // Retake or foundation
    recommendationNote = 'Review foundational thermodynamic phase changes with slower animation.';
  } else if (waterCycleScore < 80) {
    recommendedLesson = lessons[1] || lessons[0];
    recommendationNote = 'Solid grasp achieved! Reinforce with Human Heart dual circulation.';
  } else {
    // 80+ recommend next advanced lesson
    recommendedLesson = lessons[1] || lessons[2];
    recommendationNote = 'Mastery achieved! Recommended honors module: The Human Heart or Solar System.';
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Completion */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Curriculum Mastery
            </span>
            <h3 className="text-2xl font-black text-white mt-1">{overallPercentage}%</h3>
            <span className="text-xs text-blue-400 flex items-center gap-1 mt-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {completedCount} of {totalLessonsCount} Modules Complete
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-lg">
            {overallPercentage}%
          </div>
        </div>

        {/* Average Quiz Performance */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Quiz Average
            </span>
            <h3 className="text-2xl font-black text-white mt-1">{avgScore}%</h3>
            <span className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              Top 10% in Grade {profile.grade}
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg">
            <Award className="w-7 h-7" />
          </div>
        </div>

        {/* Learning Streak */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Study Streak
            </span>
            <h3 className="text-2xl font-black text-white mt-1">{profile.streakDays} Days</h3>
            <span className="text-xs text-amber-400 flex items-center gap-1 mt-1 font-medium">
              <Flame className="w-3.5 h-3.5" />
              Daily STEM Consistency
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Flame className="w-7 h-7" />
          </div>
        </div>

        {/* Verified Certificates */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              STEM Badges
            </span>
            <h3 className="text-2xl font-black text-white mt-1">{profile.certificates.length}</h3>
            <span className="text-xs text-purple-400 flex items-center gap-1 mt-1 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Accredited Achievements
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Award className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Adaptive Next Recommendation Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-950/60 border border-blue-500/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold">
            <Target className="w-3.5 h-3.5 text-blue-400" />
            Adaptive AI Recommendation Engine
          </div>
          <h3 className="text-lg font-bold text-white">
            Recommended Next Step: {recommendedLesson.title}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {recommendationNote}
          </p>
        </div>

        <button
          onClick={() => onOpenLesson(recommendedLesson.id)}
          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 shrink-0 transition-transform hover:scale-105"
        >
          <span>Launch Recommended Lesson</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Grid: Subject Progress & Topic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Progress */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Subject Competencies
            </h4>
            <span className="text-xs text-slate-400 font-medium">Grade {profile.grade} Curriculum</span>
          </div>

          <div className="space-y-3.5">
            {[
              { name: 'Science', pct: 88, color: 'from-blue-500 to-sky-400', count: '6 Modules' },
              { name: 'Mathematics', pct: 75, color: 'from-indigo-500 to-purple-400', count: '4 Modules' },
              { name: 'ICT & Computing', pct: 82, color: 'from-emerald-500 to-teal-400', count: '5 Modules' },
              { name: 'English Language', pct: 90, color: 'from-amber-500 to-orange-400', count: '4 Modules' },
              { name: 'Arabic Studies', pct: 84, color: 'from-rose-500 to-pink-400', count: '4 Modules' },
            ].map((sub) => (
              <div key={sub.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{sub.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{sub.count}</span>
                    <span className="font-bold text-white font-mono">{sub.pct}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${sub.color}`}
                    style={{ width: `${sub.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed vs In-Progress Topics */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BookCheck className="w-4 h-4 text-emerald-400" />
              Lesson Status & Quiz Records
            </h4>
            <span className="text-xs text-slate-400">Live Transcript</span>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {lessons.map((l) => {
              const score = profile.quizScores[l.id];
              const isCompleted = profile.completedLessons.includes(l.id);

              return (
                <div
                  key={l.id}
                  onClick={() => onOpenLesson(l.id)}
                  className="p-3 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-700/70 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white line-clamp-1">{l.title}</h5>
                      <span className="text-[10px] text-slate-400">
                        {isCompleted ? 'Assessment Passed' : 'In Progress'} • {l.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {score !== undefined ? (
                      <span
                        className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                          score >= 80
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : score >= 50
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {score}%
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Not assessed</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
