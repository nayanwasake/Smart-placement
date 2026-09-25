import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Sparkles,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  User,
  Save,
  Loader2,
  FileText,
} from 'lucide-react';
import { Drive, Application, JobRecommendation } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { DriveDetailsModal } from '../components/DriveDetailsModal.tsx';
import { ResumeAnalyzerModal } from '../components/ResumeAnalyzerModal.tsx';

interface StudentDashboardProps {
  currentTab: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ currentTab }) => {
  const { studentProfile, token, updateStudentProfile } = useAuth();

  const [drives, setDrives] = useState<Drive[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state for open drives
  const [filterType, setFilterType] = useState<'all' | 'eligible' | 'high-ctc'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected drive for modals
  const [selectedDrive, setSelectedDrive] = useState<Drive | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isResumeScorerOpen, setIsResumeScorerOpen] = useState(false);

  // Profile Editor state
  const [name, setName] = useState(studentProfile?.name || '');
  const [cgpa, setCgpa] = useState(studentProfile?.cgpa?.toString() || '8.0');
  const [branch, setBranch] = useState(studentProfile?.branch || 'Computer Science');
  const [batch, setBatch] = useState(studentProfile?.batch?.toString() || '2026');
  const [backlogs, setBacklogs] = useState(studentProfile?.backlogs?.toString() || '0');
  const [skillsStr, setSkillsStr] = useState(studentProfile?.skills?.join(', ') || '');
  const [resumeText, setResumeText] = useState(studentProfile?.resumeText || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (studentProfile) {
      setName(studentProfile.name);
      setCgpa(studentProfile.cgpa.toString());
      setBranch(studentProfile.branch);
      setBatch(studentProfile.batch.toString());
      setBacklogs(studentProfile.backlogs.toString());
      setSkillsStr(studentProfile.skills.join(', '));
      setResumeText(studentProfile.resumeText);
    }
  }, [studentProfile]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch drives
      const drivesRes = await fetch('/api/drives?status=approved');
      if (drivesRes.ok) {
        const dData = await drivesRes.json();
        setDrives(dData);
      }

      // 2. Fetch applications
      if (token) {
        const appsRes = await fetch('/api/applications/student', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (appsRes.ok) {
          const aData = await appsRes.json();
          setApplications(aData);
        }

        // 3. Fetch smart recommendations
        const recRes = await fetch('/api/ai/recommendations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (recRes.ok) {
          const rData = await recRes.json();
          setRecommendations(rData);
        }
      }
    } catch (err) {
      console.error('Error loading student dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Eligibility evaluation helper
  const checkEligibility = (drive: Drive) => {
    if (!studentProfile) return { isEligible: true, reason: 'Profile incomplete' };

    const cgpaOk = studentProfile.cgpa >= drive.eligibility.cgpaMin;
    const branchOk =
      drive.eligibility.branches.includes(studentProfile.branch) ||
      drive.eligibility.branches.includes('All Engineering Branches');
    const backlogOk = studentProfile.backlogs <= drive.eligibility.backlogsAllowed;

    if (!cgpaOk) {
      return {
        isEligible: false,
        reason: `CGPA requirement: ${drive.eligibility.cgpaMin} (Your CGPA: ${studentProfile.cgpa})`,
      };
    }
    if (!branchOk) {
      return {
        isEligible: false,
        reason: `Target branches: ${drive.eligibility.branches.join(', ')}`,
      };
    }
    if (!backlogOk) {
      return {
        isEligible: false,
        reason: `Backlogs exceed cutoff (Allowed: ${drive.eligibility.backlogsAllowed})`,
      };
    }

    return { isEligible: true, reason: 'Eligible' };
  };

  const handleApply = async (driveId: string) => {
    if (!token) return;

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ driveId }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to submit application');
        return;
      }

      setApplications((prev) => [data, ...prev]);
      setIsDetailsOpen(false);
    } catch (err) {
      console.error('Error applying to drive:', err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg(null);

    try {
      const updated = await updateStudentProfile({
        cgpa: parseFloat(cgpa),
        branch,
        batch: parseInt(batch, 10),
        backlogs: parseInt(backlogs, 10),
        skills: skillsStr.split(',').map((s) => s.trim()).filter(Boolean),
        resumeText,
      });

      if (updated) {
        setProfileSuccessMsg('Profile and resume successfully saved.');
        setTimeout(() => setProfileSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  // Filter drives
  const filteredDrives = drives.filter((d) => {
    const matchesSearch =
      d.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'eligible') {
      const { isEligible } = checkEligibility(d);
      return isEligible;
    }
    if (filterType === 'high-ctc') {
      return d.ctc >= 30;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Open Drives View */}
      {currentTab === 'drives' && (
        <div className="space-y-6">
          {/* AI Recommended Strip */}
          {recommendations.length > 0 && (
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-300" />
                  <h2 className="text-base font-bold">Smart Job Recommendations</h2>
                  <span className="text-xs text-blue-200">· Matched to your skills & CGPA</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {recommendations.slice(0, 3).map((rec) => {
                  const targetDrive = drives.find((d) => d._id === rec.driveId);
                  return (
                    <div
                      key={rec.driveId}
                      onClick={() => {
                        if (targetDrive) {
                          setSelectedDrive(targetDrive);
                          setIsDetailsOpen(true);
                        }
                      }}
                      className="bg-white/10 hover:bg-white/15 backdrop-blur-xs border border-white/10 p-3.5 rounded-xl cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white truncate">{rec.companyName}</span>
                        <span className="text-xs font-bold text-emerald-400">{rec.matchScore}% Match</span>
                      </div>
                      <div className="text-xs text-blue-100 font-medium mt-1 truncate">{rec.role}</div>
                      <div className="text-[11px] text-slate-300 mt-2 flex items-center justify-between">
                        <span>{rec.ctc} LPA</span>
                        <span className="text-blue-300 flex items-center gap-0.5">
                          View Drive <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search roles, companies, or skills..."
                className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Segmented Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Drives ({drives.length})
              </button>
              <button
                onClick={() => setFilterType('eligible')}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  filterType === 'eligible' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Eligible For You
              </button>
              <button
                onClick={() => setFilterType('high-ctc')}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  filterType === 'high-ctc' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Super Dream (30+ LPA)
              </button>
            </div>
          </div>

          {/* Drives Cards Grid */}
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
              <p className="text-xs text-slate-500">Loading campus drives...</p>
            </div>
          ) : filteredDrives.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8">
              <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-700">No drives match your filters</h3>
              <p className="text-xs text-slate-400 mt-1">Try resetting search query or switching tabs.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDrives.map((drive) => {
                const { isEligible, reason } = checkEligibility(drive);
                const hasApplied = applications.some((a) => a.driveId === drive._id);

                return (
                  <div
                    key={drive._id}
                    className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <div className="p-5 space-y-4">
                      {/* Top Bar */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={drive.companyLogo || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=120&h=120&q=80'}
                            alt={drive.companyName}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-100 shadow-2xs"
                          />
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{drive.role}</h3>
                            <div className="text-xs text-slate-500 font-medium">{drive.companyName}</div>
                          </div>
                        </div>
                      </div>

                      {/* Package & Key Details */}
                      <div className="flex items-baseline justify-between pt-1">
                        <div>
                          <span className="text-xl font-extrabold text-slate-900">{drive.ctc}</span>
                          <span className="text-xs font-semibold text-slate-500 ml-1">LPA CTC</span>
                        </div>
                        <span className="text-xs text-slate-500">{drive.location}</span>
                      </div>

                      {/* Eligibility Tag & Info */}
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                        <span className="text-slate-500">Min CGPA: <strong>{drive.eligibility.cgpaMin}</strong></span>
                        {isEligible ? (
                          <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
                          </span>
                        ) : (
                          <span className="text-amber-700 font-medium flex items-center gap-1 text-[11px]" title={reason}>
                            <AlertCircle className="w-3.5 h-3.5" /> Ineligible
                          </span>
                        )}
                      </div>

                      {/* Required Skills tags */}
                      <div className="flex flex-wrap gap-1">
                        {drive.requiredSkills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-[11px] bg-slate-100 text-slate-600 rounded font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {drive.requiredSkills.length > 3 && (
                          <span className="px-1.5 py-0.5 text-[11px] text-slate-400">
                            +{drive.requiredSkills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          setSelectedDrive(drive);
                          setIsResumeScorerOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Match</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedDrive(drive);
                          setIsDetailsOpen(true);
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium transition-colors"
                      >
                        {hasApplied ? 'View Status' : 'Details & Apply'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. My Applications View */}
      {currentTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Placement Applications</h2>
              <p className="text-xs text-slate-500">Track stage progression and interview call details</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
              Total: {applications.length}
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-xl border border-slate-200 p-8">
              <FileCheck2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-700">No applications submitted yet</h3>
              <p className="text-xs text-slate-400 mt-1">Browse open drives and apply to start your process.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                const stages = ['Applied', 'Shortlisted', 'Interview', 'Selected'];
                const currentStageIdx =
                  app.status === 'Rejected' ? 1 : stages.indexOf(app.status) !== -1 ? stages.indexOf(app.status) : 0;

                return (
                  <div
                    key={app._id}
                    className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{app.companyName}</h3>
                          <StatusBadge status={app.status} />
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          {app.roleTitle} · Applied on {new Date(app.appliedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">AI Resume Score</div>
                          <div className="text-xs font-bold text-blue-600">{app.resumeScore} / 100</div>
                        </div>
                      </div>
                    </div>

                    {/* Multi-Stage Visual Pipeline */}
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Application Progression Funnel
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {stages.map((stage, idx) => {
                          const isDone = idx <= currentStageIdx && app.status !== 'Rejected';
                          const isCurrent = idx === currentStageIdx;
                          return (
                            <div
                              key={stage}
                              className={`p-2 rounded-lg text-center text-xs border transition-colors ${
                                isDone
                                  ? 'bg-blue-50/70 border-blue-200 text-blue-900 font-semibold'
                                  : 'bg-slate-50 border-slate-200 text-slate-400'
                              }`}
                            >
                              <div className="text-[10px] font-bold">Step {idx + 1}</div>
                              <div className="truncate">{stage}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Current Round or Interview Details Alert */}
                    {app.interviewDetails && app.status === 'Interview' && (
                      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-1">
                        <div className="font-bold text-blue-900 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>Upcoming Interview: {app.interviewDetails.roundName}</span>
                        </div>
                        <div className="text-blue-800">
                          Date: <strong>{app.interviewDetails.date}</strong> at <strong>{app.interviewDetails.time}</strong>
                        </div>
                        {app.interviewDetails.meetLink && (
                          <div className="pt-1">
                            <a
                              href={app.interviewDetails.meetLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-blue-700 font-semibold underline"
                            >
                              Join Video Interview Link <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                        {app.interviewDetails.notes && (
                          <div className="text-[11px] text-blue-700/80 pt-1">
                            Instructions: {app.interviewDetails.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. Profile & Resume Editor View */}
      {currentTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Student Profile & Resume</h2>
              <p className="text-xs text-slate-500">
                Keep your technical skills and resume text up-to-date for automated job matching
              </p>
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Profile</span>
            </button>
          </div>

          {profileSuccessMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={name}
                className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number</label>
              <input
                type="text"
                disabled
                value={studentProfile?.rollNo || ''}
                className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CGPA (0 - 10)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Passing Batch</label>
              <input
                type="number"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Active Backlogs</label>
              <input
                type="number"
                min="0"
                value={backlogs}
                onChange={(e) => setBacklogs(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Technical Skills (Comma separated)
            </label>
            <input
              type="text"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              placeholder="e.g. React, TypeScript, Go, PostgreSQL, Docker, AWS"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Resume Text (Used for AI Matching & Job Gap Analysis)
              </label>
              <span className="text-[11px] text-slate-400">Plain text / Markdown</span>
            </div>
            <textarea
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your education, skills, key projects, and work experience here..."
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>
      )}

      {/* Drive Details Modal */}
      {selectedDrive && (
        <DriveDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          drive={selectedDrive}
          isEligible={checkEligibility(selectedDrive).isEligible}
          eligibilityReason={checkEligibility(selectedDrive).reason}
          hasApplied={applications.some((a) => a.driveId === selectedDrive._id)}
          onApply={() => handleApply(selectedDrive._id)}
          onOpenResumeScorer={() => {
            setIsDetailsOpen(false);
            setIsResumeScorerOpen(true);
          }}
        />
      )}

      {/* Resume Analyzer Modal */}
      {selectedDrive && (
        <ResumeAnalyzerModal
          isOpen={isResumeScorerOpen}
          onClose={() => setIsResumeScorerOpen(false)}
          drive={selectedDrive}
          hasApplied={applications.some((a) => a.driveId === selectedDrive._id)}
          onApply={() => handleApply(selectedDrive._id)}
        />
      )}
    </div>
  );
};
