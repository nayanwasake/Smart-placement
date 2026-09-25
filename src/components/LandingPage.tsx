import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BrainCircuit,
  BarChart3,
  Building2,
  GraduationCap,
  Users,
  Search,
  Briefcase,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../types.ts';

interface LandingPageProps {
  onOpenAuth: (tab: 'login' | 'register', role?: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const { demoLogin } = useAuth();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Header kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200/60 rounded-full text-blue-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Campus Recruitment Powered by Gemini AI</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Campus Placements,{' '}
              <span className="text-blue-600 underline decoration-blue-200 decoration-4 underline-offset-4">
                Automated & Intelligent.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
              An all-in-one placement management system connecting students, recruiting companies, and the Placement Cell. Featuring instant eligibility validation, AI resume scoring, and live interview pipelines.
            </p>

            {/* Quick Demo Persona Action Strip */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onOpenAuth('register')}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenAuth('login')}
                className="w-full sm:w-auto px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold rounded-xl transition-all"
              >
                Sign In to Account
              </button>
            </div>

            {/* One-click Demo Evaluator Buttons */}
            <div className="pt-6 border-t border-slate-100">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Instant 1-Click Evaluation Dashboards:
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <button
                  onClick={() => demoLogin('student')}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-blue-50/50 hover:text-blue-600 border border-slate-200 rounded-lg shadow-2xs transition-colors flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Student View (Priya · 8.9 CGPA)</span>
                </button>

                <button
                  onClick={() => demoLogin('recruiter')}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-emerald-50/50 hover:text-emerald-600 border border-slate-200 rounded-lg shadow-2xs transition-colors flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Recruiter View (Google Hiring Team)</span>
                </button>

                <button
                  onClick={() => demoLogin('admin')}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-purple-50/50 hover:text-purple-600 border border-slate-200 rounded-lg shadow-2xs transition-colors flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Placement Officer (TPO Analytics)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Campus Placement Metrics */}
      <section className="bg-slate-50/80 py-10 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">92.4%</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Batch Placement Ratio</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 tracking-tight">42.5 LPA</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Highest Package (Google)</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">18.6 LPA</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Average Engineering CTC</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">40+</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Recruiting Companies</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architecture Pillars */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Engineered for Precision Campus Hiring
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Eliminate spreadsheets, manual resume screenings, and eligibility confusion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Student Pillar */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 hover:border-blue-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">For Students</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Auto-filtered job drives matching your CGPA, branch, and backlogs. Score your resume directly against role requirements with Gemini AI before applying.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Instant eligibility status & rule tags</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>AI resume gap analyzer & recommendations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Drive discussion forum & interview insights</span>
              </li>
            </ul>
          </div>

          {/* Recruiter Pillar */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 hover:border-emerald-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">For Companies & Recruiters</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Post multi-stage recruitment drives with custom eligibility cutoffs. View candidate resumes ranked by AI matching score and schedule interviews effortlessly.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI-ranked candidate pipeline (Best fit first)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Multi-round recruitment tracker</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>One-click Google Meet interview invites</span>
              </li>
            </ul>
          </div>

          {/* TPO Pillar */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 hover:border-purple-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">For Placement Cell (TPO)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full governance over company verifications and drive approvals. Real-time conversion funnels, department-wise statistics, and student master directories.
            </p>
            <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Live placement percentage & package averages</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Drive approval workflows & verification queue</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Bulk student import via CSV or sample datasets</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-white font-semibold">
            <GraduationCap className="w-4 h-4 text-blue-400" />
            <span>Smart Placement Portal</span>
          </div>
          <div>Apex Institute of Technology · Training & Placement Cell</div>
          <div className="text-slate-500">© 2026 Smart Placement Portal. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};
