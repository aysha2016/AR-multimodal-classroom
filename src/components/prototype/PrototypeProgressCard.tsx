import React from 'react';
import { CheckCircle2, Lock, Hexagon, ChevronRight } from 'lucide-react';

interface PrototypeProgressCardProps {
  onViewAll?: () => void;
  onSelectTopic?: (topicName: string) => void;
}

export const PrototypeProgressCard: React.FC<PrototypeProgressCardProps> = ({
  onViewAll,
  onSelectTopic,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h4 className="text-sm sm:text-base font-bold text-slate-900">My Progress</h4>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-[#2563eb] hover:text-blue-700 hover:underline transition-colors"
        >
          View All
        </button>
      </div>

      {/* Progress Donut & Subject Summary */}
      <div className="flex items-center gap-4">
        {/* Circular Donut Gauge (75%) */}
        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            {/* Background circle */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="3.2"
            />
            {/* 75% Arc in green & cyan */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="url(#progressGrad)"
              strokeDasharray="75, 100"
              strokeLinecap="round"
              strokeWidth="3.5"
            />
            <defs>
              <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute font-black text-sm text-slate-900">75%</span>
        </div>

        {/* Subject & Topics bar */}
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">Science</span>
            <span className="text-[11px] text-slate-500 font-medium">12 / 16 topics</span>
          </div>
          <span className="text-[11px] text-slate-400 block font-medium">Grade 8</span>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }} />
          </div>
        </div>
      </div>

      {/* Topics List matching exact reference image */}
      <div className="space-y-2.5 pt-1">
        {/* 1. The Water Cycle (Completed) */}
        <div
          onClick={() => onSelectTopic && onSelectTopic('The Water Cycle')}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 shrink-0" />
            <span className="text-xs font-semibold text-slate-800">The Water Cycle</span>
          </div>
          <span className="text-xs font-bold text-emerald-600">Completed</span>
        </div>

        {/* 2. Rock Types (In Progress) */}
        <div
          onClick={() => onSelectTopic && onSelectTopic('Rock Types')}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[#2563eb] text-[10px] font-bold">
              ◎
            </div>
            <span className="text-xs font-semibold text-slate-800">Rock Types</span>
          </div>
          <span className="text-xs font-bold text-[#2563eb]">In Progress</span>
        </div>

        {/* 3. Energy and Forces (Not Started) */}
        <div
          onClick={() => onSelectTopic && onSelectTopic('Energy and Forces')}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-medium text-slate-400">Energy and Forces</span>
          </div>
          <span className="text-xs font-medium text-slate-400">Not Started</span>
        </div>
      </div>
    </div>
  );
};
