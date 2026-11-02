import React from 'react';
import { StudentProfile } from '../../types';
import { Award, CheckCircle2, Download, Printer, ShieldCheck, Sparkles } from 'lucide-react';

interface CertificatesViewProps {
  profile: StudentProfile;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({ profile }) => {
  const certificates = [
    {
      id: 'cert-1',
      title: 'Earth Hydrology & Water Systems Mastery',
      lessonTitle: 'The Water Cycle: Earth Hydrological System',
      score: 95,
      date: 'October 2026',
      accreditation: 'Global STEM Standard NGSS MS-ESS2-4',
      badgeIcon: '🌊',
    },
    {
      id: 'cert-2',
      title: 'Cardiovascular Dynamics & Physiology Honors',
      lessonTitle: 'The Human Heart & Dual Circulatory System',
      score: 88,
      date: 'October 2026',
      accreditation: 'Biomedical Science Foundation',
      badgeIcon: '❤️',
    },
    {
      id: 'cert-3',
      title: 'Keplerian Planetary Dynamics Specialist',
      lessonTitle: 'Planetary Dynamics & Solar System Orbits',
      score: 92,
      date: 'September 2026',
      accreditation: 'International Astronomical Union Academy',
      badgeIcon: '🪐',
    },
  ];

  const handlePrint = (title: string) => {
    window.print();
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-400" />
          Accredited STEM Certificates & Mastery Badges
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Certificates earned through demonstrated mastery on adaptive assessments and practical simulations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col justify-between space-y-5 relative overflow-hidden group hover:border-purple-500/50 transition-all"
          >
            {/* Background seal watermarks */}
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 rounded-full bg-purple-500/10 pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{cert.badgeIcon}</span>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Score: {cert.score}%
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Certificate of Academic Achievement
                </span>
                <h3 className="text-base font-bold text-white mt-1 group-hover:text-purple-300 transition-colors">
                  {cert.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{cert.lessonTitle}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Recipient:</span>
                  <span className="font-semibold text-slate-200">{profile.name}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Conferred:</span>
                  <span className="font-semibold text-slate-200">{cert.date}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Accreditation:</span>
                  <span className="font-semibold text-purple-400">{cert.accreditation}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handlePrint(cert.title)}
                className="w-full py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print & Export Certificate</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
