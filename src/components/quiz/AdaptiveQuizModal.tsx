import React, { useState } from 'react';
import { Lesson, QuizQuestion } from '../../types';
import {
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Award,
  Sparkles,
  BookOpen,
  ChevronRight,
} from 'lucide-react';

interface AdaptiveQuizModalProps {
  lesson: Lesson;
  isOpen: boolean;
  onClose: () => void;
  onCompleteQuiz: (lessonId: string, scorePercentage: number) => void;
  onAskTutorForHelp: (question: QuizQuestion, selectedOption: string) => void;
}

export const AdaptiveQuizModal: React.FC<AdaptiveQuizModalProps> = ({
  lesson,
  isOpen,
  onClose,
  onCompleteQuiz,
  onAskTutorForHelp,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  if (!isOpen) return null;

  const questions = lesson.quiz;
  const currentQ = questions[currentQuestionIndex];
  const selectedOptionIndex = selectedAnswers[currentQ.id];
  const hasAnsweredCurrent = selectedOptionIndex !== undefined;
  const isCorrect = selectedOptionIndex === currentQ.correctIndex;

  const handleSelectOption = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: index,
    }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Calculate final score
      let correctCount = 0;
      questions.forEach((q) => {
        if (selectedAnswers[q.id] === q.correctIndex) {
          correctCount++;
        }
      });
      const scorePct = Math.round((correctCount / questions.length) * 100);
      setIsFinished(true);
      onCompleteQuiz(lesson.id, scorePct);
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowExplanation(false);
    setIsFinished(false);
  };

  // Final score calculations
  let finalCorrect = 0;
  questions.forEach((q) => {
    if (selectedAnswers[q.id] === q.correctIndex) {
      finalCorrect++;
    }
  });
  const finalPercentage = Math.round((finalCorrect / questions.length) * 100);

  // Adaptive learning recommendations
  let recommendation = {
    level: 'Mastery',
    badge: 'STEM Honors Scholar',
    title: 'Outstanding Concept Mastery!',
    advice: 'You have mastered this concept with flying colors! Your AI tutor recommends moving on to the next advanced STEM lesson or attempting the honors research extension.',
    nextAction: 'Explore Next Advanced Lesson',
    accentColor: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
  };

  if (finalPercentage < 50) {
    recommendation = {
      level: 'Guided Foundation Needed',
      badge: 'Needs Concept Review',
      title: 'Fundamental Concept Reinforcement Recommended',
      advice: 'You experienced difficulty with key thermodynamic phase transitions. Your AI tutor recommends reviewing the 3D animated model, slowing down the animation speed, and reading the interactive labels.',
      nextAction: 'Review 3D Model with Tutor',
      accentColor: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    };
  } else if (finalPercentage < 80) {
    recommendation = {
      level: 'Proficient Understanding',
      badge: 'Solid Progress',
      title: 'Good Understanding — Minor Gaps Identified',
      advice: 'You have a solid grasp of the primary mechanisms! Your AI tutor suggests reviewing the detailed science formulas and practicing with real-world examples before attempting the final exam.',
      nextAction: 'Practice Everyday Examples',
      accentColor: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    };
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Adaptive Concept Assessment</h3>
              <p className="text-xs text-slate-400">{lesson.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        {!isFinished ? (
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Progress Bar & Question Counter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-[11px] font-mono text-blue-400 font-semibold uppercase">
                  {currentQ.difficulty} Difficulty
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question Text */}
            <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
              {currentQ.question}
            </h4>

            {/* Options List */}
            <div className="space-y-2.5 pt-1">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOptionIndex === idx;
                const isCorrectOption = idx === currentQ.correctIndex;

                let btnStyle = 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:bg-slate-700/80';
                if (showExplanation) {
                  if (isCorrectOption) {
                    btnStyle = 'bg-emerald-600/20 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500';
                  } else if (isSelected && !isCorrectOption) {
                    btnStyle = 'bg-rose-600/20 border-rose-500 text-rose-200 ring-1 ring-rose-500';
                  } else {
                    btnStyle = 'bg-slate-800/40 border-slate-800 text-slate-500';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={showExplanation}
                    className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span className="flex-1 pr-3 leading-relaxed">{opt}</span>
                    {showExplanation && isCorrectOption && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {showExplanation && isSelected && !isCorrectOption && (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Real-time Educational Feedback & Explanation Card */}
            {showExplanation && (
              <div
                className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed space-y-2 animate-in fade-in duration-200 ${
                  isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    {isCorrect ? 'Correct Analysis!' : 'Scientific Misconception'}
                  </span>
                  {!isCorrect && (
                    <button
                      onClick={() =>
                        onAskTutorForHelp(currentQ, currentQ.options[selectedOptionIndex])
                      }
                      className="text-[11px] underline hover:text-white flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Ask Tutor to Explain Mistake
                    </button>
                  )}
                </div>
                <p className="text-slate-300 text-xs">{currentQ.explanation}</p>
              </div>
            )}
          </div>
        ) : (
          /* Finished Quiz Summary Card */
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-center">
            {/* Score Radial/Badge */}
            <div className="inline-flex flex-col items-center justify-center w-28 h-28 rounded-full bg-slate-800 border-2 border-blue-500 shadow-xl shadow-blue-500/10 mx-auto">
              <span className="text-3xl font-extrabold text-white">{finalPercentage}%</span>
              <span className="text-[11px] font-semibold text-slate-400">Score</span>
            </div>

            <div>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-2 ${recommendation.accentColor}`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{recommendation.badge}</span>
              </div>
              <h4 className="text-lg font-bold text-white">{recommendation.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto mt-2">
                {recommendation.advice}
              </p>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-left">
                <span className="text-[11px] text-slate-400">Correct Answers</span>
                <p className="text-lg font-bold text-emerald-400">
                  {finalCorrect} / {questions.length}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-left">
                <span className="text-[11px] text-slate-400">Adaptive Status</span>
                <p className="text-sm font-bold text-blue-300 mt-1">{recommendation.level}</p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
          {!isFinished ? (
            <>
              <span className="text-xs text-slate-400">
                {!showExplanation ? 'Select an answer to verify' : 'Review explanation above'}
              </span>
              <button
                onClick={handleNext}
                disabled={!showExplanation}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-blue-600/20"
              >
                <span>{currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Assessment'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleRestart}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retake Quiz
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-colors shadow-md shadow-blue-600/20"
              >
                Return to Classroom
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
