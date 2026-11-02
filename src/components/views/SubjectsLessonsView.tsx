import React, { useState } from 'react';
import { Lesson, SubjectType } from '../../types';
import {
  Sparkles,
  BookOpen,
  Clock,
  ChevronRight,
  Filter,
  CheckCircle2,
  Box,
} from 'lucide-react';

interface SubjectsLessonsViewProps {
  lessons: Lesson[];
  activeSubject: SubjectType;
  onSelectSubject: (subject: SubjectType) => void;
  onLaunchLesson: (lesson: Lesson) => void;
  completedLessonIds: string[];
}

export const SubjectsLessonsView: React.FC<SubjectsLessonsViewProps> = ({
  lessons,
  activeSubject,
  onSelectSubject,
  onLaunchLesson,
  completedLessonIds,
}) => {
  const subjects: SubjectType[] = ['Science', 'Mathematics', 'English', 'Arabic', 'ICT'];
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const filteredLessons = lessons.filter((l) => {
    const matchSubject = activeSubject === 'Science' || l.subject === activeSubject;
    const matchDiff = selectedDifficulty === 'All' || l.difficulty === selectedDifficulty;
    return matchSubject && matchDiff;
  });

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Subject Tabs Navigation Bar (as per Section 3 requirement) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-xl flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => onSelectSubject(sub)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeSubject === sub
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1 pr-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs py-1 px-2 focus:outline-none"
          >
            <option value="All">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Hero Header */}
      <div>
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          {activeSubject} Modules & Visual Laboratories
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Each unit is equipped with real-time 3D simulation, interactive labels, and photorealistic tutor guidance.
        </p>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLessons.map((lesson) => {
          const isCompleted = completedLessonIds.includes(lesson.id);

          return (
            <div
              key={lesson.id}
              onClick={() => onLaunchLesson(lesson)}
              className="bg-slate-900 border border-slate-800 hover:border-blue-500/60 rounded-3xl p-4 shadow-xl flex flex-col justify-between cursor-pointer group transition-all duration-200 hover:-translate-y-1"
            >
              <div>
                {/* Thumbnail Image */}
                <div className="relative h-40 rounded-2xl overflow-hidden mb-3.5 border border-slate-700/60">
                  <img
                    src={lesson.coverImage}
                    alt={lesson.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md text-slate-200 text-xs font-bold border border-slate-700">
                    Grade {lesson.grade} {lesson.subject}
                  </div>

                  {isCompleted && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                      <CheckCircle2 className="w-3 h-3" />
                      Passed
                    </div>
                  )}

                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/90 text-white text-[11px] font-bold shadow-md">
                    <Box className="w-3 h-3" />
                    Interactive 3D
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1 mb-1.5">
                  {lesson.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {lesson.description}
                </p>

                {/* Key Concepts List */}
                <div className="space-y-1 mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Core Concepts:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {lesson.labels.slice(0, 3).map((lbl) => (
                      <span
                        key={lbl.id}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {lbl.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {lesson.durationMinutes} min
                  </span>
                  <span>•</span>
                  <span className="text-slate-300 font-medium">{lesson.difficulty}</span>
                </div>

                <button className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-blue-600/20 group-hover:bg-blue-500 transition-colors">
                  <span>Enter Lab</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
