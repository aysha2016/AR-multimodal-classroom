import React, { useState } from 'react';
import { Lesson, QuizQuestion } from '../../types';
import {
  Users,
  BookOpen,
  PlusCircle,
  FileText,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Award,
  Upload,
  BarChart,
  Calendar,
  Send,
} from 'lucide-react';

interface TeacherDashboardViewProps {
  lessons: Lesson[];
  onAddNewQuestionToLesson: (lessonId: string, question: QuizQuestion) => void;
  onAssignLessonToClass: (lessonTitle: string, dueDate: string) => void;
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  lessons,
  onAddNewQuestionToLesson,
  onAssignLessonToClass,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'roster' | 'assignment' | 'quizBuilder' | 'curriculum'>('overview');

  // Assignment form state
  const [assignLessonId, setAssignLessonId] = useState<string>(lessons[0]?.id || '');
  const [assignDueDate, setAssignDueDate] = useState<string>('2026-10-30');
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  // Custom Quiz builder form state
  const [targetLessonId, setTargetLessonId] = useState<string>(lessons[0]?.id || '');
  const [newQuestionText, setNewQuestionText] = useState<string>('');
  const [newOptions, setNewOptions] = useState<string[]>(['', '', '', '']);
  const [correctOptionIdx, setCorrectOptionIdx] = useState<number>(0);
  const [newExplanation, setNewExplanation] = useState<string>('');
  const [quizBuilderSuccess, setQuizBuilderSuccess] = useState<string | null>(null);

  // Curriculum upload note
  const [curriculumNote, setCurriculumNote] = useState<string>(
    'Grade 8 Hydrology Standards (NGSS MS-ESS2-4): Water continuously cycles among land, ocean, and atmosphere via transpiration, evaporation, condensation and precipitation.'
  );
  const [curriculumSaved, setCurriculumSaved] = useState<boolean>(false);

  // Mock Class Roster Data (Grade 8 Section A - 24 Students)
  const [roster, setRoster] = useState([
    { id: '1', name: 'Zaid Al-Mansoor', email: 'zaid.m@smartclass.edu', score: 94, status: 'Mastered', streak: 12 },
    { id: '2', name: 'Layla Kabbani', email: 'layla.k@smartclass.edu', score: 88, status: 'Mastered', streak: 15 },
    { id: '3', name: 'Adam Chen', email: 'adam.c@smartclass.edu', score: 72, status: 'Needs Review', streak: 4 },
    { id: '4', name: 'Fatima Al-Harbi', email: 'fatima.h@smartclass.edu', score: 96, status: 'Mastered', streak: 18 },
    { id: '5', name: 'Marcus Bell', email: 'marcus.b@smartclass.edu', score: 64, status: 'Needs Review', streak: 2 },
    { id: '6', name: 'Noor Al-Zahrani', email: 'noor.z@smartclass.edu', score: 91, status: 'Mastered', streak: 9 },
    { id: '7', name: 'Elena Rostova', email: 'elena.r@smartclass.edu', score: 82, status: 'Proficient', streak: 7 },
  ]);

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const l = lessons.find((x) => x.id === assignLessonId);
    if (l) {
      onAssignLessonToClass(l.title, assignDueDate);
      setAssignSuccess(`Assigned "${l.title}" to Grade 8 Section A (Due: ${assignDueDate})`);
      setTimeout(() => setAssignSuccess(null), 4000);
    }
  };

  const handleQuizBuilderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || newOptions.some((o) => !o.trim())) return;

    const newQ: QuizQuestion = {
      id: `custom-q-${Date.now()}`,
      question: newQuestionText.trim(),
      options: newOptions.map((o) => o.trim()),
      correctIndex: correctOptionIdx,
      explanation: newExplanation.trim() || 'Teacher-approved curriculum answer verification.',
      hint: 'Remember the core definitions discussed in class.',
      difficulty: 'medium',
    };

    onAddNewQuestionToLesson(targetLessonId, newQ);
    setQuizBuilderSuccess('New assessment question added! AI tutor will now test students with this question.');
    setNewQuestionText('');
    setNewOptions(['', '', '', '']);
    setNewExplanation('');
    setTimeout(() => setQuizBuilderSuccess(null), 4000);
  };

  const handleSaveCurriculum = () => {
    setCurriculumSaved(true);
    setTimeout(() => setCurriculumSaved(false), 3000);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Teacher Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'overview', label: 'Class Overview', icon: BarChart },
          { id: 'roster', label: 'Student Roster (24)', icon: Users },
          { id: 'assignment', label: 'Lesson Assignment', icon: Calendar },
          { id: 'quizBuilder', label: 'Quiz Creator', icon: PlusCircle },
          { id: 'curriculum', label: 'Curriculum Grounding', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold uppercase">Enrolled Students</span>
              <h3 className="text-2xl font-black text-white mt-1">24</h3>
              <p className="text-xs text-emerald-400 mt-1 font-medium">100% Active this week</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold uppercase">Class Average Score</span>
              <h3 className="text-2xl font-black text-white mt-1">84.2%</h3>
              <p className="text-xs text-blue-400 mt-1 font-medium">+6.4% vs district baseline</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold uppercase">Concept Mastery Rate</span>
              <h3 className="text-2xl font-black text-white mt-1">79%</h3>
              <p className="text-xs text-purple-400 mt-1 font-medium">19 of 24 proficient</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold uppercase">AI Tutor Interactions</span>
              <h3 className="text-2xl font-black text-white mt-1">312</h3>
              <p className="text-xs text-amber-400 mt-1 font-medium">High student engagement</p>
            </div>
          </div>

          {/* Topic Difficulty Matrix Report */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Diagnostic Topic Difficulty & Misconceptions Report
                </h4>
                <p className="text-xs text-slate-400">
                  Automated analysis of incorrect quiz responses across the class.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  topic: 'Thermodynamics of Condensation (Exothermic vs Endothermic)',
                  missRate: '42% of students missed',
                  recommendation: 'Recommend Dr. Sarah explain why condensation releases latent heat into air.',
                  severity: 'high',
                },
                {
                  topic: 'Infiltration vs Surface Runoff Aquifer Recharging',
                  missRate: '28% of students missed',
                  recommendation: 'Visual 3D groundwater layer demonstrated in AR Lab.',
                  severity: 'medium',
                },
                {
                  topic: 'Keplerian Orbital Velocity Variation with Distance',
                  missRate: '19% of students missed',
                  recommendation: 'Student understanding is solid; recommend honors extension.',
                  severity: 'low',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-850 border border-slate-700/70 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          item.severity === 'high'
                            ? 'bg-rose-500'
                            : item.severity === 'medium'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                      <h5 className="text-xs font-bold text-white">{item.topic}</h5>
                    </div>
                    <p className="text-xs text-slate-400">{item.recommendation}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono shrink-0">
                    {item.missRate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Student Roster */}
      {activeTab === 'roster' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white">Grade 8 Section A — Enrolled Students</h4>
            <span className="text-xs text-slate-400">Class Size: {roster.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-850 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Average Quiz Score</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Study Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {roster.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-white">{s.name}</td>
                    <td className="p-3 text-slate-400">{s.email}</td>
                    <td className="p-3 font-mono font-bold text-blue-400">{s.score}%</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                          s.status === 'Mastered'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : s.status === 'Proficient'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-amber-400">{s.streak} Days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Lesson Assignment */}
      {activeTab === 'assignment' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl max-w-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white">Assign Interactive 3D Lesson to Class</h4>
            <p className="text-xs text-slate-400">
              Assigned modules appear highlighted at the top of the student dashboard.
            </p>
          </div>

          {assignSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{assignSuccess}</span>
            </div>
          )}

          <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Select Lesson Module</label>
              <select
                value={assignLessonId}
                onChange={(e) => setAssignLessonId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
              >
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title} (Grade {l.grade} {l.subject})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Target Completion Due Date</label>
              <input
                type="date"
                value={assignDueDate}
                onChange={(e) => setAssignDueDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Publish Assignment to Students</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: Quiz Creator */}
      {activeTab === 'quizBuilder' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl max-w-2xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white">Create Custom Quiz Question</h4>
            <p className="text-xs text-slate-400">
              Questions created here immediately integrate into the active quiz and AI tutor evaluation.
            </p>
          </div>

          {quizBuilderSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{quizBuilderSuccess}</span>
            </div>
          )}

          <form onSubmit={handleQuizBuilderSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Attach to Lesson</label>
              <select
                value={targetLessonId}
                onChange={(e) => setTargetLessonId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
              >
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Question Text</label>
              <textarea
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="e.g. Which layer of the atmosphere contains the majority of cloud condensation nuclei?"
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-slate-300 font-semibold">Options & Correct Answer</label>
              {newOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={correctOptionIdx === i}
                    onChange={() => setCorrectOptionIdx(i)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...newOptions];
                      updated[i] = e.target.value;
                      setNewOptions(updated);
                    }}
                    placeholder={`Option ${i + 1} ${correctOptionIdx === i ? '(Correct Choice)' : ''}`}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Educational Explanation (Shown to students after answering)
              </label>
              <textarea
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                placeholder="Provide clear pedagogical rationale..."
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Save & Publish Question</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: Curriculum Grounding */}
      {activeTab === 'curriculum' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl max-w-2xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white">Curriculum Knowledge Base Grounding (RAG)</h4>
            <p className="text-xs text-slate-400">
              The AI tutor references these teacher-approved standards and texts when answering student questions.
            </p>
          </div>

          {curriculumSaved && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Curriculum guidelines saved and injected into AI Tutor system prompt.</span>
            </div>
          )}

          <div className="space-y-3 text-xs">
            <label className="block text-slate-300 font-semibold">Teacher Reference Material & Syllabus Notes</label>
            <textarea
              value={curriculumNote}
              onChange={(e) => setCurriculumNote(e.target.value)}
              rows={5}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-mono leading-relaxed focus:outline-none focus:border-blue-500"
            />

            <button
              onClick={handleSaveCurriculum}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Save Knowledge Grounding</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
