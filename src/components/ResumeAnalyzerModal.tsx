import React, { useEffect, useState } from 'react';
import { X, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Lightbulb, Loader2 } from 'lucide-react';
import { Drive, ResumeScoreAnalysis } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface ResumeAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  drive: Drive;
  onApply?: () => void;
  hasApplied?: boolean;
}

export const ResumeAnalyzerModal: React.FC<ResumeAnalyzerModalProps> = ({
  isOpen,
  onClose,
  drive,
  onApply,
  hasApplied = false,
}) => {
  const { token, studentProfile } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [analysis, setAnalysis] = useState<ResumeScoreAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/ai/resume-score', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            driveId: drive._id,
            resumeText: studentProfile?.resumeText,
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to compute resume match');
        }

        const data = await res.json();
        setAnalysis(data);
      } catch (err: any) {
        console.error('Error scoring resume:', err);
        setError(err.message || 'Failed to analyze resume.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [isOpen, drive._id, token, studentProfile?.resumeText]);

  if (!isOpen) return null;

  const score = analysis?.score || 0;
  const scoreColor =
    score >= 80 ? 'text-emerald-600' : score >= 65 ? 'text-blue-600' : 'text-amber-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">AI Resume Fit Analysis</h2>
              <p className="text-xs text-slate-500">
                Evaluating against <span className="font-medium text-slate-700">{drive.role}</span> at {drive.companyName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <p className="text-sm font-medium text-slate-800">Analyzing your profile with Gemini AI...</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Parsing technical skills, experience alignment, and role cutoffs
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
              {error}
            </div>
          ) : analysis ? (
            <>
              {/* Score Card */}
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-5 flex items-center justify-between gap-6">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Calculated Job Match
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-bold tracking-tight ${scoreColor}`}>
                      {analysis.score}
                    </span>
                    <span className="text-sm text-slate-400">/ 100</span>
                    <span className="text-xs font-medium text-slate-600 ml-2">
                      ({analysis.matchPercentage}% compatibility)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {analysis.summary}
                  </p>
                </div>
                {/* Visual Progress Dial */}
                <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={score >= 80 ? 'text-emerald-500' : score >= 65 ? 'text-blue-500' : 'text-amber-500'}
                      strokeDasharray={`${analysis.score}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xs font-semibold text-slate-700">
                    {score}%
                  </span>
                </div>
              </div>

              {/* Matched vs Missing Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Matched */}
                <div className="p-4 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                      Matched Skills ({analysis.matchedSkills.length})
                    </h3>
                  </div>
                  {analysis.matchedSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.matchedSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No direct skill matches detected.</p>
                  )}
                </div>

                {/* Missing / Gaps */}
                <div className="p-4 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                      Target Skills to Highlight ({analysis.missingSkills.length})
                    </h3>
                  </div>
                  {analysis.missingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.missingSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-600">Great! All required skills matched.</p>
                  )}
                </div>
              </div>

              {/* Strengths */}
              {analysis.strengths && analysis.strengths.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Profile Highlights For This Role
                  </h3>
                  <div className="space-y-1.5">
                    {analysis.strengths.map((str, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                        <span>{str}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
                      Optimization Tips
                    </h3>
                  </div>
                  <ul className="space-y-1.5">
                    {analysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-xs text-blue-900/80 flex items-start gap-2">
                        <span className="text-blue-500 font-bold">›</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Close
          </button>

          {onApply && !hasApplied && (
            <button
              onClick={() => {
                onApply();
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <span>Apply For Drive Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {hasApplied && (
            <div className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Application already submitted</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
