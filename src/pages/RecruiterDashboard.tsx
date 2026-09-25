import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  PlusCircle,
  Users,
  Building,
  CheckCircle2,
  Clock,
  Calendar,
  XCircle,
  ArrowUpRight,
  Filter,
  Download,
  Sparkles,
  Search,
  ExternalLink,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Drive, Application, CompanyProfile } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { ScheduleInterviewModal } from '../components/ScheduleInterviewModal.tsx';

interface RecruiterDashboardProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const { user, token, companyProfile } = useAuth();

  const [drives, setDrives] = useState<Drive[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string>('');
  const [candidates, setCandidates] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchCandidate, setSearchCandidate] = useState<string>('');

  // Post Drive Form State
  const [role, setRole] = useState('');
  const [ctc, setCtc] = useState('24.0');
  const [description, setDescription] = useState('');
  const [requiredSkillsStr, setRequiredSkillsStr] = useState('React, TypeScript, Node.js, SQL, System Design');
  const [cgpaMin, setCgpaMin] = useState('7.0');
  const [branches, setBranches] = useState<string[]>([
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
  ]);
  const [batch, setBatch] = useState('2026');
  const [backlogsAllowed, setBacklogsAllowed] = useState('0');
  const [openings, setOpenings] = useState('5');
  const [deadline, setDeadline] = useState('2026-11-15');
  const [location, setLocation] = useState('Bengaluru / Hybrid');
  const [creatingDrive, setCreatingDrive] = useState(false);
  const [createDriveSuccess, setCreateDriveSuccess] = useState<string | null>(null);

  // Schedule modal state
  const [schedulingApp, setSchedulingApp] = useState<Application | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Fetch company's posted drives
  const loadDrives = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/drives');
      if (res.ok) {
        const allDrives: Drive[] = await res.json();
        const myDrives = allDrives.filter(
          (d) =>
            (companyProfile && d.companyId === companyProfile._id) ||
            d.companyName.toLowerCase().includes(companyProfile?.name?.toLowerCase() || '') ||
            allDrives.length <= 5 // fallback demo
        );
        setDrives(myDrives);
        if (myDrives.length > 0 && !selectedDriveId) {
          setSelectedDriveId(myDrives[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching recruiter drives:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrives();
  }, [companyProfile]);

  // Load applicants for selected drive
  useEffect(() => {
    if (!selectedDriveId || !token) return;

    const loadCandidates = async () => {
      try {
        const res = await fetch(`/api/applications/drive/${selectedDriveId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data: Application[] = await res.json();
          setCandidates(data);
        }
      } catch (err) {
        console.error('Error fetching drive applicants:', err);
      }
    };

    loadCandidates();
  }, [selectedDriveId, token]);

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setCreatingDrive(true);
    setCreateDriveSuccess(null);

    try {
      const res = await fetch('/api/drives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role,
          ctc: parseFloat(ctc),
          description,
          requiredSkills: requiredSkillsStr.split(',').map((s) => s.trim()).filter(Boolean),
          eligibility: {
            cgpaMin: parseFloat(cgpaMin),
            branches,
            batch: parseInt(batch, 10),
            backlogsAllowed: parseInt(backlogsAllowed, 10),
          },
          openings: parseInt(openings, 10),
          deadline,
          location,
          rounds: [
            { name: 'Online Coding Challenge', description: '90-min algorithmic assessment', order: 1 },
            { name: 'Technical Round 1', description: 'Data structures & problem solving', order: 2 },
            { name: 'Technical Round 2', description: 'Architecture & concurrency', order: 3 },
            { name: 'HR & Cultural Values', description: 'Behavioral & leadership fit', order: 4 },
          ],
        }),
      });

      const newDrive = await res.json();
      if (!res.ok) {
        alert(newDrive.error || 'Failed to post drive');
        return;
      }

      setDrives((prev) => [newDrive, ...prev]);
      setSelectedDriveId(newDrive._id);
      setCreateDriveSuccess('Drive successfully posted! It is now pending approval by the Placement Cell.');
      setRole('');
      setDescription('');
    } catch (err) {
      console.error('Error posting drive:', err);
    } finally {
      setCreatingDrive(false);
    }
  };

  const handleUpdateStatus = async (appId: string, status: string, roundName?: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          ...(roundName && { currentRound: roundName }),
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setCandidates((prev) => prev.map((c) => (c._id === appId ? updated : c)));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleExportCsv = () => {
    if (candidates.length === 0) return;

    const headers = ['Name', 'Email', 'RollNo', 'Branch', 'CGPA', 'Status', 'AI Resume Score', 'Current Round'];
    const rows = candidates.map((c) => [
      `"${c.studentName}"`,
      `"${c.studentEmail}"`,
      `"${c.studentRollNo}"`,
      `"${c.studentBranch}"`,
      c.studentCgpa,
      `"${c.status}"`,
      c.resumeScore,
      `"${c.currentRound}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `candidates_${selectedDriveId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.studentName.toLowerCase().includes(searchCandidate.toLowerCase()) ||
      c.studentRollNo.toLowerCase().includes(searchCandidate.toLowerCase()) ||
      c.studentBranch.toLowerCase().includes(searchCandidate.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'all') return true;
    return c.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Recruiter Verification Notice if pending */}
      {companyProfile && !companyProfile.verified && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Company Verification In Progress:</strong> Your profile is currently under review by the Placement Cell (TPO). Newly posted drives will remain in <em>Pending Approval</em> until verified.
            </span>
          </div>
        </div>
      )}

      {/* 1. Posted Drives View */}
      {currentTab === 'drives' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Active Recruitment Drives</h2>
              <p className="text-xs text-slate-500">Manage posted roles, view applicant counts, and track deadlines</p>
            </div>
            <button
              onClick={() => onSelectTab('post-drive')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Drive</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drives.map((drive) => (
              <div
                key={drive._id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{drive.role}</h3>
                      <div className="text-xs text-slate-500 font-medium">{drive.companyName}</div>
                    </div>
                    <StatusBadge status={drive.status} />
                  </div>

                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-lg font-bold text-slate-900">{drive.ctc} LPA</span>
                    <span className="text-slate-500">{drive.openings} Openings</span>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>Min CGPA: <strong>{drive.eligibility.cgpaMin}</strong></div>
                    <div>Branches: {drive.eligibility.branches.slice(0, 2).join(', ')}...</div>
                    <div>Deadline: {drive.deadline}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedDriveId(drive._id);
                      onSelectTab('candidates');
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>View Candidates</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Post New Drive View */}
      {currentTab === 'post-drive' && (
        <form onSubmit={handleCreateDrive} className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6 max-w-3xl">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Post a Campus Recruitment Drive</h2>
            <p className="text-xs text-slate-500">Define job role, compensation, and automated eligibility criteria</p>
          </div>

          {createDriveSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{createDriveSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Role Title</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Software Engineer (Full Stack)"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CTC Package (in LPA)</label>
              <input
                type="number"
                step="0.5"
                required
                value={ctc}
                onChange={(e) => setCtc(e.target.value)}
                placeholder="24.0"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Min. CGPA Cutoff</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                required
                value={cgpaMin}
                onChange={(e) => setCgpaMin(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Active Backlogs</label>
              <input
                type="number"
                min="0"
                required
                value={backlogsAllowed}
                onChange={(e) => setBacklogsAllowed(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Batch</label>
              <input
                type="number"
                required
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Required Skills (comma separated)
            </label>
            <input
              type="text"
              required
              value={requiredSkillsStr}
              onChange={(e) => setRequiredSkillsStr(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description & Responsibilities</label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline role responsibilities, growth prospects, and day-to-day work..."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Openings</label>
              <input
                type="number"
                min="1"
                required
                value={openings}
                onChange={(e) => setOpenings(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Application Deadline</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={creatingDrive}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              {creatingDrive ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              <span>Submit Drive For Approval</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. Candidates Pipeline View */}
      {currentTab === 'candidates' && (
        <div className="space-y-4">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-xs font-semibold text-slate-500">Drive:</label>
              <select
                value={selectedDriveId}
                onChange={(e) => setSelectedDriveId(e.target.value)}
                className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                {drives.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.role} ({d.companyName})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="relative">
                <input
                  type="text"
                  value={searchCandidate}
                  onChange={(e) => setSearchCandidate(e.target.value)}
                  placeholder="Filter name or branch..."
                  className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              </div>

              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                title="Export candidate list to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* AI Ranking Badge Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Candidates automatically ranked by Gemini AI Match Score (Best match first)</span>
            </div>
            <span>{filteredCandidates.length} candidates in pipeline</span>
          </div>

          {/* Candidates Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Academic & Branch</th>
                    <th className="py-3 px-4">AI Resume Score</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No applicants found for this drive.
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{c.studentName}</div>
                          <div className="text-[11px] text-slate-500">{c.studentRollNo} · {c.studentEmail}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">CGPA: {c.studentCgpa}</div>
                          <div className="text-[11px] text-slate-500">{c.studentBranch}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-bold ${
                                c.resumeScore >= 85
                                  ? 'text-emerald-600'
                                  : c.resumeScore >= 70
                                  ? 'text-blue-600'
                                  : 'text-amber-600'
                              }`}
                            >
                              {c.resumeScore}
                            </span>
                            <span className="text-[10px] text-slate-400">/ 100</span>
                          </div>
                          {c.scoreBreakdown?.matchedSkills && (
                            <div className="text-[10px] text-slate-400 truncate max-w-xs">
                              {c.scoreBreakdown.matchedSkills.slice(0, 3).join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={c.status} />
                          <div className="text-[10px] text-slate-500 mt-1">{c.currentRound}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {c.status !== 'Shortlisted' && c.status !== 'Interview' && c.status !== 'Selected' && (
                              <button
                                onClick={() => handleUpdateStatus(c._id, 'Shortlisted', 'Shortlisted for Round 1')}
                                className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded transition-colors"
                              >
                                Shortlist
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSchedulingApp(c);
                                setIsScheduleOpen(true);
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded transition-colors"
                            >
                              Schedule
                            </button>

                            {c.status !== 'Selected' && (
                              <button
                                onClick={() => handleUpdateStatus(c._id, 'Selected', 'Offer Extended (Placed)')}
                                className="px-2.5 py-1 text-[11px] font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 rounded transition-colors"
                              >
                                Select
                              </button>
                            )}

                            {c.status !== 'Rejected' && (
                              <button
                                onClick={() => handleUpdateStatus(c._id, 'Rejected', 'Application Closed')}
                                className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title="Reject candidate"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. Company Profile View */}
      {currentTab === 'company-profile' && companyProfile && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4 max-w-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Company Profile</h2>
              <p className="text-xs text-slate-500">Official recruiter credentials and campus presence</p>
            </div>
            <StatusBadge status={companyProfile.verified ? 'Verified Company' : 'Verification Pending'} />
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 uppercase font-semibold text-[10px]">Organization</label>
              <div className="text-sm font-bold text-slate-900">{companyProfile.name}</div>
            </div>
            <div>
              <label className="text-slate-400 uppercase font-semibold text-[10px]">Industry</label>
              <div className="text-slate-800">{companyProfile.industry}</div>
            </div>
            <div>
              <label className="text-slate-400 uppercase font-semibold text-[10px]">Website</label>
              <div>
                <a href={companyProfile.website || '#'} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  {companyProfile.website || 'Not specified'}
                </a>
              </div>
            </div>
            <div>
              <label className="text-slate-400 uppercase font-semibold text-[10px]">About Organization</label>
              <p className="text-slate-600 leading-relaxed">{companyProfile.description || 'Global tech employer.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        application={schedulingApp}
        onScheduled={(updated) => {
          setCandidates((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
        }}
      />
    </div>
  );
};
