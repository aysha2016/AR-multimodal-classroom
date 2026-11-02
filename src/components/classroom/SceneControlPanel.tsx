import React from 'react';
import {
  Sliders,
  Sun,
  Grid,
  Layers,
  CircleDot,
  Check,
  RotateCcw,
  Sparkles,
  X,
  HelpCircle,
} from 'lucide-react';

export type RenderMode = 'solid' | 'wireframe' | 'hybrid';

export interface SceneRenderSettings {
  ambientOcclusion: boolean;
  aoIntensity: number; // 0.0 to 1.0
  lightingIntensity: number; // 0.2 to 2.5
  renderMode: RenderMode;
}

interface SceneControlPanelProps {
  settings: SceneRenderSettings;
  onChangeSettings: (newSettings: Partial<SceneRenderSettings>) => void;
  onReset: () => void;
  onClose?: () => void;
}

export const SceneControlPanel: React.FC<SceneControlPanelProps> = ({
  settings,
  onChangeSettings,
  onReset,
  onClose,
}) => {
  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-slate-100 w-80 space-y-4 select-none animate-in fade-in slide-in-from-bottom-2 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white leading-tight">3D Shading & Optics</h4>
            <span className="text-[10px] text-slate-400 font-medium">Educational render controls</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onReset}
            title="Reset to default render settings"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-[10px] flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 1. Render Mode: Solid vs. Wireframe vs. Hybrid */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <Grid className="w-3.5 h-3.5 text-blue-400" />
            <span>Render Mode</span>
          </label>
          <span className="text-[10px] font-mono text-blue-400 uppercase font-bold">
            {settings.renderMode}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {/* Solid Mode */}
          <button
            onClick={() => onChangeSettings({ renderMode: 'solid' })}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold flex flex-col items-center gap-1 transition-all ${
              settings.renderMode === 'solid'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Solid</span>
          </button>

          {/* Wireframe Mode */}
          <button
            onClick={() => onChangeSettings({ renderMode: 'wireframe' })}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold flex flex-col items-center gap-1 transition-all ${
              settings.renderMode === 'wireframe'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Wireframe</span>
          </button>

          {/* Hybrid Mode (Solid + Wireframe overlay) */}
          <button
            onClick={() => onChangeSettings({ renderMode: 'hybrid' })}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold flex flex-col items-center gap-1 transition-all ${
              settings.renderMode === 'hybrid'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hybrid</span>
          </button>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          {settings.renderMode === 'wireframe' && 'Inspect polygon topology, tessellation and underlying geometry.'}
          {settings.renderMode === 'solid' && 'Photorealistic PBR materials with full diffuse and specular shading.'}
          {settings.renderMode === 'hybrid' && 'Combines colored surface volume with edge wireframe lines.'}
        </p>
      </div>

      {/* 2. Ambient Occlusion (AO) Toggle & Intensity */}
      <div className="space-y-2 pt-1 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <CircleDot className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ambient Occlusion</span>
          </label>

          {/* Modern Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={settings.ambientOcclusion}
            onClick={() => onChangeSettings({ ambientOcclusion: !settings.ambientOcclusion })}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.ambientOcclusion ? 'bg-blue-600' : 'bg-slate-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                settings.ambientOcclusion ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* AO Intensity Slider (when enabled) */}
        {settings.ambientOcclusion ? (
          <div className="space-y-1 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Crevice Depth & Grounding</span>
              <span className="font-mono text-cyan-400 font-bold">
                {Math.round(settings.aoIntensity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={settings.aoIntensity}
              onChange={(e) => onChangeSettings({ aoIntensity: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>Soft</span>
              <span>Medium</span>
              <span>Deep</span>
            </div>
          </div>
        ) : (
          <div className="text-[10px] text-slate-400 bg-slate-950/40 p-2 rounded-xl border border-slate-800/40">
            AO disabled: flat ambient shading across internal crevices and seams.
          </div>
        )}
      </div>

      {/* 3. Global Lighting Intensity */}
      <div className="space-y-2 pt-1 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Global Lighting Intensity</span>
          </label>
          <span className="text-[11px] font-mono text-amber-300 font-bold">
            {settings.lightingIntensity.toFixed(2)}x
          </span>
        </div>

        <input
          type="range"
          min="0.2"
          max="2.5"
          step="0.05"
          value={settings.lightingIntensity}
          onChange={(e) => onChangeSettings({ lightingIntensity: parseFloat(e.target.value) })}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />

        {/* Quick Lighting Presets */}
        <div className="flex items-center gap-1.5">
          {[
            { label: 'Studio (0.6x)', val: 0.6 },
            { label: 'Normal (1.0x)', val: 1.0 },
            { label: 'Bright (1.8x)', val: 1.8 },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => onChangeSettings({ lightingIntensity: preset.val })}
              className={`flex-1 py-1 rounded-lg text-[10px] font-medium transition-colors border ${
                Math.abs(settings.lightingIntensity - preset.val) < 0.05
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
