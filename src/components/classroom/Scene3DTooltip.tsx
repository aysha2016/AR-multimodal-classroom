import React from 'react';
import { InteractiveLabel } from '../../types';
import { Volume2, MessageSquare, X } from 'lucide-react';

interface Scene3DTooltipProps {
  label: InteractiveLabel;
  position: { x: number; y: number; visible: boolean };
  isActive: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onCloseExpanded: () => void;
  onAskTutor: () => void;
  onExplainAndPoint: () => void;
}

export const Scene3DTooltip: React.FC<Scene3DTooltipProps> = ({
  label,
  position,
  isActive,
  isHovered,
  onSelect,
  onMouseEnter,
  onMouseLeave,
  onCloseExpanded,
  onAskTutor,
  onExplainAndPoint,
}) => {
  if (!position.visible) return null;

  const showExpanded = isActive || isHovered;

  return (
    <div
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 z-20 select-none transition-transform duration-150"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* 1. COMPACT, UNCONGESTED FLOATING PILL (Matches exact prototype reference) */}
      <button
        onClick={onSelect}
        className={`relative px-3 py-1.5 rounded-full border backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-all cursor-pointer ${
          isActive
            ? 'bg-blue-600 border-white text-white shadow-blue-500/50 scale-105 ring-2 ring-white/60 z-30'
            : 'bg-[#0c1f4a]/90 hover:bg-blue-600/90 border-blue-400/50 text-white hover:border-cyan-300 hover:scale-105'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isActive ? 'bg-amber-300 ring-2 ring-amber-400/40' : 'bg-cyan-400'
          }`}
        />
        <span className="font-semibold text-xs tracking-tight whitespace-nowrap">{label.name}</span>
      </button>

      {/* 2. MINIMAL ELEGANT CALLOUT (Only appears on hover/select, sleek & compact) */}
      {showExpanded && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-blue-400/60 rounded-2xl p-2.5 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-150 pointer-events-auto z-40">
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-white/10">
            <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">{label.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseExpanded();
              }}
              className="text-slate-400 hover:text-white p-0.5 rounded-md hover:bg-white/10"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <p className="text-[11px] text-slate-200 leading-relaxed line-clamp-2">{label.shortExplanation}</p>

          <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-white/10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExplainAndPoint();
              }}
              className="flex-1 py-1 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
            >
              <Volume2 className="w-2.5 h-2.5" />
              <span>Explain</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAskTutor();
              }}
              className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-semibold flex items-center justify-center gap-1 border border-cyan-500/30 active:scale-95 transition-all"
            >
              <MessageSquare className="w-2.5 h-2.5" />
              <span>Ask Tutor</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
