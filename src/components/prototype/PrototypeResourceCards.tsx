import React, { useState } from 'react';
import { Lesson } from '../../types';
import {
  Box,
  Layers,
  Image as ImageIcon,
  PlaySquare,
  FileQuestion,
} from 'lucide-react';

interface PrototypeResourceCardsProps {
  currentLessonId: string;
  onSelectLesson: (lessonId: string) => void;
  onSelectDiagram?: (lessonId?: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const PrototypeResourceCards: React.FC<PrototypeResourceCardsProps> = ({
  currentLessonId,
  onSelectLesson,
  onSelectDiagram,
  onSelectCategory,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('Interactive Simulations');

  const categories = [
    { id: 'Interactive Simulations', icon: Box },
    { id: '3D Models', icon: Layers },
    { id: 'Diagrams', icon: ImageIcon },
    { id: 'Videos', icon: PlaySquare },
    { id: 'Practice Questions', icon: FileQuestion },
  ];

  const cards = [
    {
      id: 'water-cycle',
      title: 'Water Cycle',
      thumb: './assets/prototype/thumb-water-cycle.png',
    },
    {
      id: 'human-heart',
      title: 'Human Heart',
      thumb: './assets/prototype/thumb-human-heart.png',
    },
    {
      id: 'solar-system',
      title: 'Solar System',
      thumb: './assets/prototype/thumb-solar-system.png',
    },
    {
      id: 'plant-cell',
      title: 'Plant Cell',
      thumb: './assets/prototype/thumb-plant-cell.png',
    },
    {
      id: 'volcano',
      title: 'Volcano',
      thumb: './assets/prototype/thumb-volcano.png',
    },
    {
      id: 'electric-circuit',
      title: 'Electric Circuit',
      thumb: './assets/prototype/thumb-electric-circuit.png',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4">
      {/* Category Tabs Header matching exact reference image */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                if (cat.id === 'Diagrams' && onSelectDiagram) {
                  onSelectDiagram(currentLessonId);
                }
                if (onSelectCategory) {
                  onSelectCategory(cat.id);
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#2f66ee] text-white shadow-sm'
                  : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.id}</span>
            </button>
          );
        })}
      </div>

      {/* 6 Cards Row matching exact reference image */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {cards.map((card) => {
          const isSelected = card.id === currentLessonId;

          return (
            <div
              key={card.id}
              onClick={() => {
                onSelectLesson(card.id);
                if (activeCategory === 'Diagrams' && onSelectDiagram) {
                  onSelectDiagram(card.id);
                }
              }}
              className={`rounded-2xl overflow-hidden p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-150 group bg-white ${
                isSelected
                  ? 'border-2 border-[#2f66ee] shadow-md ring-2 ring-blue-500/20'
                  : 'border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs'
              }`}
            >
              {/* Thumbnail image */}
              <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-900 mb-2 relative">
                <img
                  src={card.thumb}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              {/* Title */}
              <h5
                className={`text-xs font-bold text-center truncate ${
                  isSelected ? 'text-[#2f66ee]' : 'text-slate-800 group-hover:text-slate-900'
                }`}
              >
                {card.title}
              </h5>
            </div>
          );
        })}
      </div>
    </div>
  );
};
