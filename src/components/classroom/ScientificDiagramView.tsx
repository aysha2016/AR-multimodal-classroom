import React, { useState } from 'react';
import { Lesson, InteractiveLabel, TeacherAvatarConfig } from '../../types';
import { Layers, ZoomIn, ZoomOut, RotateCcw, Volume2, Sparkles, CheckCircle2, Info } from 'lucide-react';
import { avatarAudioEngine } from '../../services/avatarAudioEngine';

interface ScientificDiagramViewProps {
  lesson: Lesson;
  activeLabel: InteractiveLabel | null;
  onSelectLabel: (label: InteractiveLabel) => void;
  onSwitchTo3D: () => void;
  isPlayingNarration?: boolean;
  currentTeacher?: TeacherAvatarConfig;
}

export const ScientificDiagramView: React.FC<ScientificDiagramViewProps> = ({
  lesson,
  activeLabel,
  onSelectLabel,
  onSwitchTo3D,
  isPlayingNarration = true,
  currentTeacher,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showFlowGuides, setShowFlowGuides] = useState<boolean>(true);
  const [circuitClosed, setCircuitClosed] = useState<boolean>(true);

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(1.6, prev + 0.15));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(0.85, prev - 0.15));
  const handleResetZoom = () => setZoomLevel(1);

  // When a diagram feature is clicked
  const handleFeatureClick = (labelId: string) => {
    const found = lesson.labels.find(
      (lbl) => lbl.id.toLowerCase() === labelId.toLowerCase() || lbl.id.includes(labelId) || labelId.includes(lbl.id)
    );
    if (found) {
      onSelectLabel(found);
      avatarAudioEngine.unlockAudio();
      avatarAudioEngine.triggerGesture('point', found.name, 4500, 'label');
      if (isPlayingNarration) {
        avatarAudioEngine.speak(found.detailedExplanation, currentTeacher?.voiceName || 'Kore');
      }
    }
  };

  const isSelected = (idPart: string) => {
    if (!activeLabel) return false;
    return activeLabel.id.toLowerCase().includes(idPart.toLowerCase()) || idPart.toLowerCase().includes(activeLabel.id.toLowerCase());
  };

  return (
    <div className="w-full h-full flex-1 p-3 sm:p-5 flex flex-col items-center justify-start bg-slate-950 overflow-y-auto">
      <div className="max-w-4xl w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  2D Scientific Architectural Schematic
                </h4>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Vector Precision
                </span>
              </div>
              <p className="text-xs text-slate-400">{lesson.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Flow Guides Toggle */}
            <button
              onClick={() => setShowFlowGuides(!showFlowGuides)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                showFlowGuides
                  ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle directional flow arrows and dynamics"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Flow Guides</span>
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg p-0.5">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.85}
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-slate-300 px-1.5">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 1.6}
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1.5 text-slate-400 hover:text-white transition-colors border-l border-slate-700"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={onSwitchTo3D}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-md shadow-blue-600/25 transition-all"
            >
              3D Simulation
            </button>
          </div>
        </div>

        {/* DIAGRAM CANVAS CONTAINER */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-gradient-to-b from-slate-950 via-[#060b18] to-slate-950 rounded-2xl border border-slate-800/90 p-2 sm:p-4 flex items-center justify-center overflow-hidden shadow-inner">
          <div
            className="w-full h-full transition-transform duration-300 ease-out flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* 1. WATER CYCLE SCIENTIFIC DIAGRAM */}
            {lesson.id === 'water-cycle' && (
              <svg viewBox="0 0 800 480" className="w-full h-full select-none" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="skyAtmosphere" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#08142b" />
                    <stop offset="55%" stopColor="#11274c" />
                    <stop offset="100%" stopColor="#1e3a68" />
                  </linearGradient>
                  <linearGradient id="oceanWater" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" />
                    <stop offset="40%" stopColor="#0369a1" />
                    <stop offset="100%" stopColor="#0c4a6e" />
                  </linearGradient>
                  <linearGradient id="mountainRock" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="60%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                  <filter id="sunThermalGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Sky & Atmospheric Grid */}
                <rect width="800" height="480" fill="url(#skyAtmosphere)" rx="16" />
                <path d="M 0 340 L 800 340" stroke="#334155" strokeDasharray="4 6" strokeWidth="0.8" opacity="0.4" />
                <text x="785" y="335" fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">TROPOSPHERE BOUNDARY (Sea Level 0m)</text>

                {/* Radiant Solar Thermal Source */}
                <g
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => handleFeatureClick('evaporation')}
                >
                  <circle cx="700" cy="85" r="42" fill="#fbbf24" filter="url(#sunThermalGlow)" opacity="0.9" />
                  <circle cx="700" cy="85" r="32" fill="#f59e0b" />
                  <text x="700" y="82" fill="#1e293b" fontSize="11" fontWeight="bold" textAnchor="middle">SOLAR</text>
                  <text x="700" y="96" fill="#1e293b" fontSize="9" fontWeight="bold" textAnchor="middle">RADIATION</text>
                  {/* Solar thermal rays */}
                  <line x1="655" y1="120" x2="600" y2="280" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.75" />
                  <line x1="680" y1="135" x2="660" y2="330" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.75" />
                </g>

                {/* Mountain Range (Alpine Orographic Barrier) */}
                <polygon points="40,380 180,140 320,380" fill="url(#mountainRock)" stroke="#64748b" strokeWidth="1.5" />
                {/* Glacial Snowcap */}
                <polygon points="145,200 180,140 215,200 195,190 180,205 165,190" fill="#f8fafc" />
                {/* Secondary Ridge */}
                <polygon points="200,380 310,210 420,380" fill="#1e293b" opacity="0.85" stroke="#475569" strokeWidth="1.2" />

                {/* Collection Reservoir / Ocean Basin */}
                <path d="M 380 380 Q 480 350 620 350 Q 750 350 800 370 L 800 480 L 320 480 Z" fill="url(#oceanWater)" />
                <path d="M 400 370 Q 560 360 800 370" stroke="#38bdf8" strokeWidth="2" fill="none" opacity="0.6" />

                {/* Subterranean Aquifer / Groundwater Infiltration */}
                <rect x="0" y="380" width="400" height="100" fill="#0f172a" />
                <text x="30" y="440" fill="#475569" fontSize="11" fontWeight="bold">Subterranean Bedrock & Aquifer</text>
                <path d="M 180 370 Q 230 420 380 430" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4 4" fill="none" opacity="0.6" />

                {/* Condensation Clouds */}
                <g
                  className={`cursor-pointer transition-all ${isSelected('condensation') ? 'filter drop-shadow-[0_0_12px_#818cf8]' : ''}`}
                  onClick={() => handleFeatureClick('condensation')}
                >
                  <path
                    d="M 120 100 Q 150 60 210 85 Q 260 55 320 85 Q 360 110 330 145 Q 210 160 120 100 Z"
                    fill="#cbd5e1"
                    stroke={isSelected('condensation') ? '#818cf8' : '#94a3b8'}
                    strokeWidth={isSelected('condensation') ? '3' : '1.5'}
                    opacity="0.95"
                  />
                  <text x="220" y="112" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">
                    Condensation Clouds
                  </text>
                  <text x="220" y="126" fill="#334155" fontSize="9" textAnchor="middle">
                    H₂O (g) → H₂O (l) + Latent Heat
                  </text>
                </g>

                {/* Precipitation Rain Droplets */}
                <g
                  className={`cursor-pointer transition-all ${isSelected('precipitation') ? 'filter drop-shadow-[0_0_12px_#60a5fa]' : ''}`}
                  onClick={() => handleFeatureClick('precipitation')}
                >
                  {[160, 190, 220, 250, 280].map((x, idx) => (
                    <line
                      key={idx}
                      x1={x}
                      y1={155 + (idx % 2) * 10}
                      x2={x - 20}
                      y2={290 + (idx % 3) * 15}
                      stroke="#60a5fa"
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                    />
                  ))}
                  <rect x="150" y="225" width="135" height="28" rx="6" fill="#0f172a" stroke="#60a5fa" strokeWidth="1.2" />
                  <text x="217" y="243" fill="#60a5fa" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Precipitation (Rain)
                  </text>
                </g>

                {/* Evaporation Thermal Updrafts */}
                <g
                  className={`cursor-pointer transition-all ${isSelected('evaporation') ? 'filter drop-shadow-[0_0_12px_#38bdf8]' : ''}`}
                  onClick={() => handleFeatureClick('evaporation')}
                >
                  <path d="M 540 340 Q 560 270 540 200" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 4" fill="none" />
                  <polygon points="536,195 540,185 548,198" fill="#38bdf8" />
                  <path d="M 620 340 Q 640 260 620 180" stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 4" fill="none" />
                  <polygon points="616,175 620,165 628,178" fill="#38bdf8" />
                  <rect x="520" y="250" width="135" height="28" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
                  <text x="587" y="268" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Evaporation (Vapor)
                  </text>
                </g>

                {/* Surface Runoff Stream */}
                <g
                  className={`cursor-pointer transition-all ${isSelected('collection') ? 'filter drop-shadow-[0_0_12px_#0ea5e9]' : ''}`}
                  onClick={() => handleFeatureClick('collection')}
                >
                  <path d="M 230 330 Q 310 360 410 380" stroke="#0ea5e9" strokeWidth="4" fill="none" strokeDasharray="5 3" />
                  <rect x="290" y="340" width="130" height="26" rx="6" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1.2" />
                  <text x="355" y="357" fill="#0ea5e9" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Surface Runoff & Lake
                  </text>
                </g>
              </svg>
            )}

            {/* 2. HUMAN HEART SCIENTIFIC ANATOMICAL SCHEMATIC */}
            {lesson.id === 'human-heart' && (
              <svg viewBox="0 0 800 500" className="w-full h-full select-none" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="oxygenatedBlood" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#b91c1c" />
                  </linearGradient>
                  <linearGradient id="deoxygenatedBlood" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                  <linearGradient id="myocardiumWall" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#881337" />
                    <stop offset="50%" stopColor="#9f1239" />
                    <stop offset="100%" stopColor="#be123c" />
                  </linearGradient>
                </defs>

                {/* Dark Clinical Backdrop */}
                <rect width="800" height="500" fill="#070d18" rx="16" />

                {/* Directional legend bar at top */}
                <g transform="translate(30, 25)">
                  <rect width="18" height="12" rx="3" fill="#3b82f6" />
                  <text x="26" y="10" fill="#93c5fd" fontSize="10" fontWeight="bold">Deoxygenated (Venous Return)</text>
                  <rect x="230" width="18" height="12" rx="3" fill="#ef4444" />
                  <text x="256" y="10" fill="#fca5a5" fontSize="10" fontWeight="bold">Oxygenated (Systemic Output)</text>
                </g>

                {/* Heart Base Structural Myocardium Outer Silhouette */}
                <path
                  d="M 270 210 Q 230 250 250 350 Q 270 420 400 470 Q 530 420 570 340 Q 600 240 540 180 Q 460 140 400 180 Q 330 150 270 210 Z"
                  fill="url(#myocardiumWall)"
                  stroke="#fda4af"
                  strokeWidth="2.5"
                  opacity="0.9"
                />

                {/* 1. Superior Vena Cava (Deoxygenated in from top right of anatomical left) */}
                <g
                  className="cursor-pointer transition-transform hover:opacity-90"
                  onClick={() => handleFeatureClick('right-atrium')}
                >
                  <path d="M 280 60 L 280 180 L 325 180 L 325 60 Z" fill="url(#deoxygenatedBlood)" stroke="#93c5fd" strokeWidth="1.5" />
                  {showFlowGuides && (
                    <path d="M 302 75 L 302 165" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="6 4" />
                  )}
                  <text x="240" y="90" fill="#60a5fa" fontSize="11" fontWeight="bold">Superior Vena Cava</text>
                  <line x1="240" y1="95" x2="280" y2="105" stroke="#3b82f6" strokeWidth="1.2" />
                </g>

                {/* 2. Inferior Vena Cava (Deoxygenated from lower body) */}
                <path d="M 285 410 L 285 470 L 330 470 L 330 380 Z" fill="url(#deoxygenatedBlood)" opacity="0.8" />

                {/* 3. Ascending Aorta & Arch (Oxygenated systemic powerhouse) */}
                <g
                  className={`cursor-pointer transition-all ${isSelected('aorta') ? 'filter drop-shadow-[0_0_15px_#ef4444]' : ''}`}
                  onClick={() => handleFeatureClick('aorta')}
                >
                  <path
                    d="M 380 190 Q 370 100 420 70 Q 480 65 490 120 L 490 190 L 450 190 Q 445 110 420 110 Q 405 110 405 190 Z"
                    fill="url(#oxygenatedBlood)"
                    stroke={isSelected('aorta') ? '#ffffff' : '#fca5a5'}
                    strokeWidth={isSelected('aorta') ? '3' : '1.5'}
                  />
                  {/* Three aortic arch brachiocephalic arteries */}
                  <rect x="425" y="40" width="10" height="32" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
                  <rect x="445" y="36" width="10" height="36" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
                  <rect x="465" y="42" width="10" height="30" fill="#ef4444" stroke="#fca5a5" strokeWidth="1" />
                  {showFlowGuides && (
                    <path d="M 400 170 Q 405 95 445 95 Q 470 95 470 170" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="6 4" fill="none" />
                  )}
                  <rect x="520" y="70" width="165" height="30" rx="6" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="602" y="89" fill="#fca5a5" fontSize="12" fontWeight="bold" textAnchor="middle">
                    Aorta & Systemic Arch
                  </text>
                  <line x1="520" y1="85" x2="480" y2="90" stroke="#ef4444" strokeWidth="1.5" />
                </g>

                {/* 4. Pulmonary Artery (Carries deoxygenated blood to lungs) */}
                <g
                  className={`cursor-pointer transition-all ${isSelected('pulmonary-artery') ? 'filter drop-shadow-[0_0_15px_#6366f1]' : ''}`}
                  onClick={() => handleFeatureClick('pulmonary-artery')}
                >
                  <path
                    d="M 345 190 L 350 130 Q 360 110 330 110 L 270 110 L 270 140 L 330 140 Q 370 140 375 190 Z"
                    fill="#4338ca"
                    stroke={isSelected('pulmonary-artery') ? '#ffffff' : '#818cf8'}
                    strokeWidth={isSelected('pulmonary-artery') ? '3' : '1.5'}
                  />
                  <rect x="110" y="130" width="150" height="30" rx="6" fill="#0f172a" stroke="#6366f1" strokeWidth="1.5" />
                  <text x="185" y="149" fill="#c7d2fe" fontSize="12" fontWeight="bold" textAnchor="middle">
                    Pulmonary Artery
                  </text>
                  <line x1="260" y1="145" x2="300" y2="135" stroke="#6366f1" strokeWidth="1.5" />
                </g>

                {/* Internal Cavities: 4 Chambers */}
                {/* A. Right Atrium (Anatomical Right, visual Left) */}
                <g
                  className={`cursor-pointer transition-all ${isSelected('right-atrium') ? 'filter drop-shadow-[0_0_12px_#3b82f6]' : ''}`}
                  onClick={() => handleFeatureClick('right-atrium')}
                >
                  <ellipse cx="320" cy="240" rx="45" ry="40" fill="url(#deoxygenatedBlood)" opacity="0.9" />
                  <text x="320" y="244" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Right Atrium
                  </text>
                  <text x="320" y="258" fill="#bfdbfe" fontSize="8" textAnchor="middle">
                    (Venous Chamber)
                  </text>
                  <line x1="300" y1="280" x2="335" y2="280" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 3" />
                  <text x="210" y="280" fill="#93c5fd" fontSize="9">Tricuspid Valve</text>
                </g>

                {/* B. Right Ventricle */}
                <g className="cursor-pointer" onClick={() => handleFeatureClick('right-atrium')}>
                  <path d="M 290 290 Q 280 370 350 410 Q 370 350 370 290 Z" fill="url(#deoxygenatedBlood)" opacity="0.95" />
                  <text x="330" y="350" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Right Ventricle
                  </text>
                  <text x="330" y="364" fill="#bfdbfe" fontSize="8" textAnchor="middle">
                    (To Lungs ~25 mmHg)
                  </text>
                </g>

                {/* Interventricular Septum */}
                <path d="M 370 230 L 375 435 L 400 435 L 400 230 Z" fill="#4c0519" stroke="#fda4af" strokeWidth="1" />
                <text x="388" y="330" fill="#fecdd3" fontSize="8" textAnchor="middle" transform="rotate(-90 388 330)">
                  INTERVENTRICULAR SEPTUM
                </text>

                {/* C. Left Atrium (Oxygenated return from lungs) */}
                <g className="cursor-pointer" onClick={() => handleFeatureClick('left-ventricle')}>
                  <ellipse cx="460" cy="235" rx="42" ry="38" fill="url(#oxygenatedBlood)" opacity="0.9" />
                  <text x="460" y="239" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Left Atrium
                  </text>
                  <text x="460" y="253" fill="#fecaca" fontSize="8" textAnchor="middle">
                    (Pulmonary Return)
                  </text>
                  <line x1="440" y1="275" x2="480" y2="275" stroke="#ffffff" strokeWidth="2" strokeDasharray="3 3" />
                  <text x="505" y="275" fill="#fca5a5" fontSize="9">Mitral Valve</text>
                </g>

                {/* D. Left Ventricle (High-pressure muscular systemic pump) */}
                <g
                  className={`cursor-pointer transition-all ${isSelected('left-ventricle') ? 'filter drop-shadow-[0_0_15px_#ef4444]' : ''}`}
                  onClick={() => handleFeatureClick('left-ventricle')}
                >
                  <path d="M 410 280 Q 405 410 440 440 Q 520 400 500 280 Z" fill="url(#oxygenatedBlood)" opacity="0.98" />
                  <text x="455" y="350" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">
                    Left Ventricle
                  </text>
                  <text x="455" y="366" fill="#fee2e2" fontSize="9" fontWeight="bold" textAnchor="middle">
                    (Systemic ~120 mmHg)
                  </text>
                  <rect x="550" y="360" width="180" height="42" rx="8" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="640" y="378" fill="#fca5a5" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Thick Muscular Myocardium
                  </text>
                  <text x="640" y="393" fill="#94a3b8" fontSize="9" textAnchor="middle">
                    Pumps through entire human body
                  </text>
                  <line x1="550" y1="380" x2="495" y2="370" stroke="#ef4444" strokeWidth="1.5" />
                </g>
              </svg>
            )}

            {/* 3. SOLAR SYSTEM ORBITAL SCHEMATIC */}
            {lesson.id === 'solar-system' && (
              <svg viewBox="0 0 850 500" className="w-full h-full select-none" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <radialGradient id="solarCorona" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="25%" stopColor="#fef08a" />
                    <stop offset="60%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                  </radialGradient>
                  <filter id="sunRayBurst" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="12" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Deep Cosmic Void */}
                <rect width="850" height="500" fill="#030712" rx="16" />

                {/* Distance Scale Indicator */}
                <text x="40" y="35" fill="#64748b" fontSize="10" fontFamily="monospace">
                  KEPLERIAN ELLIPTICAL ORBITS (Scale: Inner 1 AU → Outer 10 AU)
                </text>

                {/* Orbital Ellipses */}
                {[75, 115, 160, 210, 280, 360].map((radius, idx) => (
                  <ellipse
                    key={idx}
                    cx="140"
                    cy="250"
                    rx={radius}
                    ry={radius * 0.72}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth={idx === 2 ? '2' : '1'}
                    strokeDasharray={idx === 2 ? '4 2' : '2 3'}
                  />
                ))}

                {/* Asteroid Belt Between Mars and Jupiter */}
                <ellipse cx="140" cy="250" rx="245" ry="176" fill="none" stroke="#475569" strokeWidth="6" strokeDasharray="1 8" opacity="0.6" />
                <text x="385" y="235" fill="#94a3b8" fontSize="8" fontFamily="monospace">ASTEROID BELT</text>

                {/* Central Sun (Sol) */}
                <g
                  className={`cursor-pointer transition-all ${isSelected('the-sun') ? 'filter drop-shadow-[0_0_25px_#f59e0b]' : ''}`}
                  onClick={() => handleFeatureClick('the-sun')}
                >
                  <circle cx="140" cy="250" r="54" fill="url(#solarCorona)" filter="url(#sunRayBurst)" />
                  <circle cx="140" cy="250" r="44" fill="#f59e0b" />
                  <text x="140" y="246" fill="#18181b" fontSize="12" fontWeight="bold" textAnchor="middle">
                    THE SUN
                  </text>
                  <text x="140" y="260" fill="#27272a" fontSize="8" fontWeight="bold" textAnchor="middle">
                    (99.8% Mass)
                  </text>
                </g>

                {/* Mercury */}
                <g className="cursor-pointer" onClick={() => handleFeatureClick('inner')}>
                  <circle cx="215" cy="250" r="4" fill="#94a3b8" />
                  <text x="215" y="240" fill="#94a3b8" fontSize="8" textAnchor="middle">Mercury (0.39 AU)</text>
                </g>

                {/* Venus */}
                <g className="cursor-pointer" onClick={() => handleFeatureClick('inner')}>
                  <circle cx="250" cy="225" r="7" fill="#fde047" />
                  <text x="250" y="213" fill="#fde047" fontSize="8" textAnchor="middle">Venus (0.72 AU)</text>
                </g>

                {/* Earth & Moon (Habitable Goldilocks Zone) */}
                <g
                  className={`cursor-pointer transition-all ${isSelected('earth-orbit') ? 'filter drop-shadow-[0_0_15px_#38bdf8]' : ''}`}
                  onClick={() => handleFeatureClick('earth-orbit')}
                >
                  {/* Habitable Zone Glow */}
                  <ellipse cx="140" cy="250" rx="160" ry="115" fill="none" stroke="#0ea5e9" strokeWidth="1.5" opacity="0.4" />
                  <circle cx="295" cy="275" r="9" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                  {/* Moon orbit */}
                  <circle cx="310" cy="270" r="2.5" fill="#e2e8f0" />
                  <rect x="250" y="305" width="130" height="34" rx="6" fill="#0f172a" stroke="#0284c7" strokeWidth="1.2" />
                  <text x="315" y="322" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Earth & Luna (1.0 AU)
                  </text>
                  <text x="315" y="333" fill="#94a3b8" fontSize="8" textAnchor="middle">
                    Circumstellar Habitable Zone
                  </text>
                  <line x1="295" y1="284" x2="305" y2="305" stroke="#38bdf8" strokeWidth="1" />
                </g>

                {/* Mars */}
                <g className="cursor-pointer" onClick={() => handleFeatureClick('inner')}>
                  <circle cx="345" cy="220" r="6" fill="#ef4444" />
                  <text x="345" y="208" fill="#f87171" fontSize="8" textAnchor="middle">Mars (1.52 AU)</text>
                </g>

                {/* Jupiter (Jovian King) */}
                <g className="cursor-pointer" onClick={() => handleFeatureClick('gas-giants')}>
                  <circle cx="410" cy="285" r="22" fill="#d97706" stroke="#fbbf24" strokeWidth="1.2" />
                  {/* Great Red Spot */}
                  <ellipse cx="420" cy="292" rx="4" ry="2.5" fill="#dc2626" />
                  <text x="410" y="320" fill="#fde68a" fontSize="9" fontWeight="bold" textAnchor="middle">
                    Jupiter (5.2 AU)
                  </text>
                </g>

                {/* Saturn & Ring System */}
                <g
                  className={`cursor-pointer transition-all ${isSelected('saturn-rings') ? 'filter drop-shadow-[0_0_18px_#eab308]' : ''}`}
                  onClick={() => handleFeatureClick('saturn-rings')}
                >
                  <ellipse cx="495" cy="205" rx="38" ry="10" fill="none" stroke="#fef08a" strokeWidth="4" opacity="0.85" transform="rotate(-15 495 205)" />
                  <circle cx="495" cy="205" r="16" fill="#ca8a04" stroke="#fef08a" strokeWidth="1.2" />
                  <ellipse cx="495" cy="205" rx="32" ry="7" fill="none" stroke="#fde047" strokeWidth="2" opacity="0.95" transform="rotate(-15 495 205)" />
                  <rect x="520" y="165" width="160" height="34" rx="6" fill="#0f172a" stroke="#eab308" strokeWidth="1.2" />
                  <text x="600" y="181" fill="#fde047" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Saturn & Ring System
                  </text>
                  <text x="600" y="193" fill="#94a3b8" fontSize="8" textAnchor="middle">
                    (9.5 AU • H₂/He Giant)
                  </text>
                  <line x1="520" y1="185" x2="495" y2="195" stroke="#eab308" strokeWidth="1" />
                </g>

                {/* Uranus & Neptune */}
                <g className="cursor-pointer" onClick={() => handleFeatureClick('gas-giants')}>
                  <circle cx="680" cy="290" r="12" fill="#06b6d4" />
                  <text x="680" y="315" fill="#67e8f9" fontSize="9" textAnchor="middle">Uranus (19.2 AU)</text>
                  <circle cx="760" cy="220" r="11" fill="#3b82f6" />
                  <text x="760" y="245" fill="#93c5fd" fontSize="9" textAnchor="middle">Neptune (30.1 AU)</text>
                </g>
              </svg>
            )}

            {/* 4. VOLCANO GEOLOGICAL CROSS-SECTION SCHEMATIC */}
            {lesson.id === 'volcano' && (
              <svg viewBox="0 0 800 500" className="w-full h-full select-none" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="magmaCore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="30%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                  <linearGradient id="crustLayer" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>
                  <filter id="eruptionGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <rect width="800" height="500" fill="#0b0f19" rx="16" />

                {/* Plinian Ash Plume & Cloud */}
                <g className="cursor-pointer" onClick={() => handleFeatureClick('crater-vent')}>
                  <path
                    d="M 360 170 Q 320 80 260 60 Q 200 40 240 15 Q 350 -10 440 20 Q 520 10 560 50 Q 580 90 440 140 Q 420 170 410 170 Z"
                    fill="#475569"
                    opacity="0.85"
                  />
                  <path
                    d="M 370 170 Q 350 110 320 80 Q 400 30 460 70 Q 440 120 410 170 Z"
                    fill="#64748b"
                    opacity="0.9"
                  />
                  {/* Pyroclastic ejecta */}
                  {[340, 360, 380, 400, 420].map((x, i) => (
                    <circle key={i} cx={x + (i % 2) * 10} cy={110 + i * 12} r={2.5 + (i % 3)} fill="#fb923c" />
                  ))}
                  <text x="470" y="45" fill="#f8fafc" fontSize="12" fontWeight="bold">Explosive Ash Column</text>
                  <text x="470" y="60" fill="#cbd5e1" fontSize="9">Tephra & Pyroclastic Cloud</text>
                </g>

                {/* Volcano Mountain Cone Profile */}
                <polygon points="120,400 370,170 420,170 680,400" fill="url(#crustLayer)" stroke="#475569" strokeWidth="2" />

                {/* Stratovolcano Stratified Layers (Ash + Lava alternating) */}
                <line x1="200" y1="360" x2="600" y2="360" stroke="#64748b" strokeWidth="2" strokeDasharray="8 6" opacity="0.6" />
                <line x1="260" y1="310" x2="540" y2="310" stroke="#64748b" strokeWidth="2" strokeDasharray="8 6" opacity="0.6" />
                <line x1="310" y1="250" x2="490" y2="250" stroke="#64748b" strokeWidth="2" strokeDasharray="8 6" opacity="0.6" />

                {/* Lava Flow Down Right Flank */}
                <path d="M 420 175 Q 490 240 560 320 Q 610 370 650 400" stroke="#ea580c" strokeWidth="6" fill="none" opacity="0.9" />
                <path d="M 420 175 Q 490 240 560 320 Q 610 370 650 400" stroke="#fef08a" strokeWidth="2" fill="none" />

                {/* Parasitic Flank Cone & Branch Pipe */}
                <polygon points="560,370 610,320 650,370" fill="#334155" stroke="#475569" strokeWidth="1.5" />
                <path d="M 400 320 L 605 325" stroke="#f97316" strokeWidth="5" fill="none" />
                <text x="620" y="315" fill="#fdba74" fontSize="9" fontWeight="bold">Parasitic Cone</text>

                {/* Central Conduit / Throat */}
                <g
                  className={`cursor-pointer transition-all ${isSelected('crater-vent') ? 'filter drop-shadow-[0_0_15px_#ef4444]' : ''}`}
                  onClick={() => handleFeatureClick('crater-vent')}
                >
                  <polygon points="380,170 415,170 410,400 385,400" fill="url(#magmaCore)" stroke="#f97316" strokeWidth="1.5" />
                  <rect x="160" y="180" width="165" height="34" rx="6" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="242" y="198" fill="#fca5a5" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Main Conduit & Crater
                  </text>
                  <text x="242" y="209" fill="#94a3b8" fontSize="8" textAnchor="middle">
                    Vent Decompression Zone
                  </text>
                  <line x1="325" y1="197" x2="385" y2="210" stroke="#ef4444" strokeWidth="1.2" />
                </g>

                {/* Lithosphere Subsurface Bedrock */}
                <rect x="0" y="400" width="800" height="100" fill="#1e1b4b" stroke="#312e81" strokeWidth="2" />
                <text x="40" y="435" fill="#818cf8" fontSize="11" fontWeight="bold">Continental Lithosphere Crust</text>

                {/* Subsurface Magma Reservoir / Chamber */}
                <g
                  className={`cursor-pointer transition-all ${isSelected('magma-chamber') ? 'filter drop-shadow-[0_0_20px_#f97316]' : ''}`}
                  onClick={() => handleFeatureClick('magma-chamber')}
                >
                  <ellipse cx="395" cy="450" rx="140" ry="42" fill="url(#magmaCore)" filter="url(#eruptionGlow)" />
                  <text x="395" y="448" fill="#18181b" fontSize="13" fontWeight="bold" textAnchor="middle">
                    MAGMA RESERVOIR
                  </text>
                  <text x="395" y="462" fill="#27272a" fontSize="9" fontWeight="bold" textAnchor="middle">
                    Buoyant Molten Rock & Dissolved Volatiles
                  </text>
                  <rect x="560" y="435" width="180" height="34" rx="6" fill="#0f172a" stroke="#f97316" strokeWidth="1.5" />
                  <text x="650" y="452" fill="#fdba74" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Magma Chamber
                  </text>
                  <text x="650" y="463" fill="#94a3b8" fontSize="8" textAnchor="middle">
                    High Lithostatic Pressure
                  </text>
                  <line x1="560" y1="452" x2="520" y2="452" stroke="#f97316" strokeWidth="1.5" />
                </g>
              </svg>
            )}

            {/* 5. ELECTRIC CIRCUIT SCHEMATIC DIAGRAM */}
            {lesson.id === 'electric-circuit' && (
              <svg viewBox="0 0 800 480" className="w-full h-full select-none" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="batteryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </linearGradient>
                  <radialGradient id="lampGlowLight" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <rect width="800" height="480" fill="#090d16" rx="16" />

                {/* Circuit Schematic Title */}
                <g transform="translate(30, 25)">
                  <text x="0" y="12" fill="#94a3b8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                    DC CLOSED-LOOP SCHEMATIC: V = I × R (Ohm’s Law)
                  </text>
                  <text x="0" y="26" fill="#64748b" fontSize="9" fontFamily="monospace">
                    Conventional Current (Clockwise) vs. Electron Drift (Counter-Clockwise)
                  </text>
                </g>

                {/* Circuit Copper Wire Loop */}
                <path
                  d="M 180 240 L 180 130 L 400 130 L 620 130 L 620 240 L 620 370 L 400 370 L 180 370 Z"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                {/* Active Current Flow Glow (When switch is closed) */}
                {circuitClosed && (
                  <path
                    d="M 180 240 L 180 130 L 400 130 L 620 130 L 620 240 L 620 370 L 400 370 L 180 370 Z"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    strokeDasharray="12 16"
                    className="animate-pulse"
                  />
                )}

                {/* 1. DC 9V Battery Source */}
                <g
                  className={`cursor-pointer transition-all ${isSelected('dc-battery') ? 'filter drop-shadow-[0_0_15px_#38bdf8]' : ''}`}
                  onClick={() => handleFeatureClick('dc-battery')}
                >
                  {/* Battery Body */}
                  <rect x="150" y="200" width="60" height="85" rx="8" fill="url(#batteryGrad)" stroke="#7dd3fc" strokeWidth="2" />
                  <rect x="165" y="190" width="12" height="10" rx="2" fill="#e2e8f0" />
                  <rect x="192" y="192" width="8" height="8" rx="2" fill="#94a3b8" />
                  <text x="180" y="235" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">9V</text>
                  <text x="180" y="250" fill="#e0f2fe" fontSize="9" textAnchor="middle">BATTERY</text>
                  <text x="171" y="215" fill="#f87171" fontSize="12" fontWeight="bold">+</text>
                  <text x="196" y="215" fill="#60a5fa" fontSize="14" fontWeight="bold">-</text>

                  {/* Callout Tag */}
                  <rect x="30" y="225" width="105" height="36" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
                  <text x="82" y="243" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">DC Voltage (9V)</text>
                  <text x="82" y="254" fill="#94a3b8" fontSize="8" textAnchor="middle">Potential Source</text>
                  <line x1="135" y1="243" x2="150" y2="243" stroke="#38bdf8" strokeWidth="1" />
                </g>

                {/* 2. SPST Switch at Top Wire */}
                <g
                  className={`cursor-pointer transition-all ${isSelected('switch') ? 'filter drop-shadow-[0_0_15px_#10b981]' : ''}`}
                  onClick={() => {
                    setCircuitClosed(!circuitClosed);
                    handleFeatureClick('switch');
                  }}
                >
                  <rect x="340" y="112" width="120" height="36" rx="8" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
                  {/* Contacts */}
                  <circle cx="370" cy="130" r="5" fill="#f8fafc" />
                  <circle cx="430" cy="130" r="5" fill="#f8fafc" />
                  {/* Knife lever */}
                  {circuitClosed ? (
                    <line x1="370" y1="130" x2="430" y2="130" stroke="#10b981" strokeWidth="4" />
                  ) : (
                    <line x1="370" y1="130" x2="420" y2="105" stroke="#ef4444" strokeWidth="4" />
                  )}
                  <text x="400" y="98" fill={circuitClosed ? '#34d399' : '#f87171'} fontSize="11" fontWeight="bold" textAnchor="middle">
                    Switch: {circuitClosed ? 'CLOSED (Conducting)' : 'OPEN (Interrupted)'}
                  </text>
                </g>

                {/* 3. Incandescent Lamp (Load) on Right Wire */}
                <g
                  className={`cursor-pointer transition-all ${isSelected('filament-lamp') ? 'filter drop-shadow-[0_0_20px_#fbbf24]' : ''}`}
                  onClick={() => handleFeatureClick('filament-lamp')}
                >
                  {/* Radiant Glow Orb if circuit closed */}
                  {circuitClosed && (
                    <circle cx="620" cy="240" r="55" fill="url(#lampGlowLight)" />
                  )}
                  {/* Bulb Glass Globe */}
                  <circle cx="620" cy="240" r="32" fill="#1e293b" stroke="#fef08a" strokeWidth="2" opacity="0.9" />
                  {/* Tungsten Filament (W) */}
                  <path
                    d="M 610 250 L 615 235 L 620 245 L 625 235 L 630 250"
                    fill="none"
                    stroke={circuitClosed ? '#ffffff' : '#94a3b8'}
                    strokeWidth="2.5"
                  />
                  <rect x="670" y="220" width="115" height="40" rx="6" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.2" />
                  <text x="727" y="238" fill="#fbbf24" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Incandescent Lamp
                  </text>
                  <text x="727" y="250" fill="#94a3b8" fontSize="8" textAnchor="middle">
                    {circuitClosed ? 'Radiant Photons (Lit)' : 'Filament Cold (Off)'}
                  </text>
                  <line x1="670" y1="240" x2="652" y2="240" stroke="#fbbf24" strokeWidth="1" />
                </g>

                {/* 4. Fixed Resistor at Bottom Wire */}
                <g className="cursor-pointer" onClick={() => handleFeatureClick('filament-lamp')}>
                  <rect x="350" y="358" width="100" height="24" rx="4" fill="#d97706" stroke="#fde047" strokeWidth="1.5" />
                  {/* Resistance color bands */}
                  <rect x="368" y="358" width="6" height="24" fill="#ef4444" />
                  <rect x="382" y="358" width="6" height="24" fill="#3b82f6" />
                  <rect x="396" y="358" width="6" height="24" fill="#10b981" />
                  <rect x="420" y="358" width="6" height="24" fill="#fbbf24" />
                  <text x="400" y="405" fill="#fef08a" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Load Resistor (R = 220 Ω)
                  </text>
                </g>

                {/* Directional electron flow particles */}
                {circuitClosed && showFlowGuides && (
                  <g>
                    {[200, 260, 320, 480, 540, 600].map((pos, i) => (
                      <g key={i}>
                        <circle cx={pos} cy="130" r="4" fill="#fde047" />
                        <text x={pos} y="133" fill="#0f172a" fontSize="7" fontWeight="bold" textAnchor="middle">e⁻</text>
                      </g>
                    ))}
                    <text x="400" y="160" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle">
                      → Direction of Conventional Current (I) →
                    </text>
                  </g>
                )}
              </svg>
            )}

            {/* 6. PLANT CELL ARCHITECTURE SCHEMATIC */}
            {lesson.id === 'plant-cell' && (
              <svg viewBox="0 0 800 480" className="w-full h-full select-none" preserveAspectRatio="xMidYMid meet">
                <rect width="800" height="480" fill="#06120e" rx="16" />

                {/* Cellulose Cell Wall (Rigid outer polygon) */}
                <polygon
                  points="140,80 660,80 720,240 660,400 140,400 80,240"
                  fill="#064e3b"
                  stroke="#10b981"
                  strokeWidth="8"
                />
                {/* Plasma Membrane */}
                <polygon
                  points="148,88 652,88 710,240 652,392 148,392 90,240"
                  fill="#022c22"
                  stroke="#34d399"
                  strokeWidth="2.5"
                />

                {/* Central Vacuole (Huge fluid reservoir maintaining turgor pressure) */}
                <path
                  d="M 320 140 Q 560 120 580 250 Q 590 350 360 360 Q 260 340 320 140 Z"
                  fill="#0369a1"
                  opacity="0.8"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                <text x="440" y="245" fill="#e0f2fe" fontSize="13" fontWeight="bold" textAnchor="middle">
                  Central Vacuole
                </text>
                <text x="440" y="260" fill="#bae6fd" fontSize="9" textAnchor="middle">
                  (90% Cell Volume • Turgor Pressure)
                </text>

                {/* Nucleus with Genetic Chromatin & Nucleolus */}
                <g className="cursor-pointer" onClick={() => handleFeatureClick('nucleus')}>
                  <circle cx="210" cy="220" r="48" fill="#7c2d12" stroke="#fb923c" strokeWidth="2" />
                  <circle cx="205" cy="215" r="16" fill="#ea580c" />
                  <text x="210" y="242" fill="#ffedd5" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Nucleus
                  </text>
                </g>

                {/* Chloroplasts (Photosynthetic factories with stacked thylakoids) */}
                <g className="cursor-pointer" onClick={() => handleFeatureClick('chloroplast')}>
                  {[
                    { cx: 280, cy: 110, rot: 15 },
                    { cx: 520, cy: 105, rot: -20 },
                    { cx: 630, cy: 200, rot: 45 },
                    { cx: 270, cy: 340, rot: -10 },
                    { cx: 600, cy: 330, rot: 25 },
                  ].map((pos, idx) => (
                    <g key={idx} transform={`rotate(${pos.rot} ${pos.cx} ${pos.cy})`}>
                      <ellipse cx={pos.cx} cy={pos.cy} rx="28" ry="16" fill="#15803d" stroke="#4ade80" strokeWidth="1.5" />
                      <line x1={pos.cx - 15} y1={pos.cy} x2={pos.cx + 15} y2={pos.cy} stroke="#86efac" strokeWidth="2" strokeDasharray="3 2" />
                    </g>
                  ))}
                  <rect x="470" y="30" width="165" height="30" rx="6" fill="#0f172a" stroke="#22c55e" strokeWidth="1.2" />
                  <text x="552" y="49" fill="#4ade80" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Chloroplasts (Photosynthesis)
                  </text>
                </g>

                {/* Mitochondria (Cellular respiration) */}
                <ellipse cx="180" cy="330" rx="22" ry="12" fill="#b91c1c" stroke="#f87171" strokeWidth="1.2" />
                <path d="M 165 330 Q 172 324 180 330 Q 188 336 195 330" stroke="#fca5a5" strokeWidth="1.5" fill="none" />
                <text x="180" y="355" fill="#fca5a5" fontSize="8" textAnchor="middle">Mitochondria</text>
              </svg>
            )}
          </div>
        </div>

        {/* CLICKABLE LABELS & SCIENTIFIC LEGEND */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              Interactive Anatomy & Component Directory:
            </span>
            <span>Click any label to inspect & hear scientific explanation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {lesson.labels.map((lbl) => {
              const isLblSelected = activeLabel?.id === lbl.id;
              return (
                <button
                  key={lbl.id}
                  onClick={() => onSelectLabel(lbl)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isLblSelected
                      ? 'bg-blue-600/25 border-blue-400 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-400'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: lbl.accentColor }} />
                      <span className="text-xs font-bold truncate">{lbl.name}</span>
                    </div>
                    {isLblSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{lbl.shortExplanation}</p>
                </button>
              );
            })}
          </div>

          {/* Active Detail Callout Card */}
          {activeLabel && (
            <div className="mt-3 p-3.5 rounded-xl bg-slate-800/80 border border-blue-500/40 text-slate-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeLabel.accentColor }} />
                  <span className="font-bold text-white text-sm">{activeLabel.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {activeLabel.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{activeLabel.detailedExplanation}</p>
                {activeLabel.scienceFormula && (
                  <div className="font-mono text-[11px] text-amber-300 bg-slate-900/80 px-2 py-1 rounded inline-block mt-1">
                    {activeLabel.scienceFormula}
                  </div>
                )}
              </div>

              {isPlayingNarration && (
                <button
                  onClick={() => {
                    avatarAudioEngine.unlockAudio();
                    avatarAudioEngine.triggerGesture('point', activeLabel.name, 4500, 'label');
                    avatarAudioEngine.speak(activeLabel.detailedExplanation, currentTeacher?.voiceName || 'Kore');
                  }}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Hear Audio
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
