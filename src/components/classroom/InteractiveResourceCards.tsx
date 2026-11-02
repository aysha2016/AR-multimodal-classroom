import React, { useState } from 'react';
import { Lesson } from '../../types';
import {
  Sparkles,
  Box,
  Layers,
  HelpCircle,
  Clock,
  BookOpen,
  ChevronRight,
  Flame,
  Activity,
  Orbit,
  Zap,
  Sprout,
  Droplet,
} from 'lucide-react';

interface InteractiveResourceCardsProps {
  lessons: Lesson[];
  currentLessonId: string;
  onSelectLesson: (lesson: Lesson) => void;
}

export const InteractiveResourceCards: React.FC<InteractiveResourceCardsProps> = ({
  lessons,
  currentLessonId,
  onSelectLesson,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Interactive Simulations',
    '3D Models',
    'Diagrams',
    'Practice Questions',
  ];

  const getSceneIcon = (type: Lesson['sceneType']) => {
    switch (type) {
      case 'water-cycle':
        return <Droplet className="w-4 h-4 text-sky-400" />;
      case 'heart':
        return <Activity className="w-4 h-4 text-rose-400" />;
      case 'solar-system':
        return <Orbit className="w-4 h-4 text-amber-400" />;
      case 'plant-cell':
        return <Sprout className="w-4 h-4 text-emerald-400" />;
      case 'volcano':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'circuit':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      default:
        return <Box className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Category Pills & Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            Curriculum Visual Simulations & Labs
          </h3>
          <p className="text-xs text-slate-400">
            Select any module to load its dedicated 3D scene, scientific schematic, and interactive quiz.
          </p>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontally scrollable Resource Cards */}
      <div className="flex items-stretch gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-700">
        {lessons.map((lesson) => {
          const isActive = lesson.id === currentLessonId;

          return (
            <div
              key={lesson.id}
              onClick={() => onSelectLesson(lesson)}
              className={`min-w-[280px] max-w-[300px] rounded-2xl border p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 group shrink-0 ${
                isActive
                  ? 'bg-gradient-to-b from-blue-900/40 via-slate-850 to-slate-900 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                  : 'bg-slate-850/80 hover:bg-slate-800 border-slate-700/70 hover:border-slate-600 shadow-md'
              }`}
            >
              <div>
                {/* Thumbnail Preview Image with Badges */}
                <div className="relative h-32 rounded-xl overflow-hidden mb-3 border border-slate-700/60">
                  <img
                    src={lesson.coverImage}
                    alt={lesson.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Top Subject Tag */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/85 backdrop-blur-md text-[10px] font-bold text-slate-200 border border-slate-700">
                    {getSceneIcon(lesson.sceneType)}
                    <span>Grade {lesson.grade}</span>
                  </div>

                  {/* Active Indicator Badge */}
                  {isActive && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold shadow-md">
                      <Sparkles className="w-3 h-3" />
                      Active Lesson
                    </div>
                  )}

                  {/* 3D Model Badge */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/90 text-cyan-300 text-[10px] font-medium border border-cyan-500/30">
                    <Box className="w-3 h-3 text-cyan-400" />
                    <span>Interactive 3D</span>
                  </div>
                </div>

                {/* Lesson Title */}
                <h4 className="text-sm font-bold text-white line-clamp-1 mb-1 group-hover:text-blue-300 transition-colors">
                  {lesson.title}
                </h4>

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {lesson.description}
                </p>
              </div>

              {/* Bottom Metadata & Launch Action */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {lesson.durationMinutes}m
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                    {lesson.difficulty}
                  </span>
                </div>

                <div
                  className={`text-xs font-semibold flex items-center gap-1 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'
                  }`}
                >
                  <span>{isActive ? 'Current' : 'Launch'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
