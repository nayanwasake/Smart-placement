import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  ShieldCheck,
  Users,
  Building,
  CheckCircle2,
  XCircle,
  Download,
  Upload,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Award,
  DollarSign,
  FileSpreadsheet,
  Check,
  AlertCircle,
  Layers,
  Printer,
} from 'lucide-react';
import { AnalyticsData, Drive, CompanyProfile, StudentProfile } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { BulkImportModal } from '../components/BulkImportModal.tsx';

interface AdminDashboardProps {
  currentTab: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentTab }) => {
  const { token } = useAuth();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [drives, setDrives] = useState<Drive[]>([]);
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & student table controls
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentBranchFilter, setStudentBranchFilter] = useState('all');
  const [studentPlacementFilter, setStudentPlacementFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Analytics
      const aRes = await fetch('/api/analytics');
      if (aRes.ok) {
        const aData = await aRes.json();
        setAnalytics(aData);
      }

      // 2. Drives
      const dRes = await fetch('/api/drives');
      if (dRes.ok) {
        const dData = await dRes.json();
        setDrives(dData);
      }

      // 3. Companies
      if (token) {
        const cRes = await fetch('/api/companies', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cRes.ok) {
          const cData = await cRes.json();
          setCompanies(cData);
        }

        // 4. Students
        const sRes = await fetch('/api/students', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (sRes.ok) {
          const sData = await sRes.json();
          setStudents(sData);
        }
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [token]);

  const handleApproveDrive = async (driveId: string, status: 'approved' | 'rejected') => {
    if (!token) return;
    try {
      const res = await fetch(`/api/drives/${driveId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDrives((prev) => prev.map((d) => (d._id === driveId ? updated : d)));
        loadAllData();
      }
    } catch (err) {
      console.error('Error approving drive:', err);
    }
  };

  const handleVerifyCompany = async (companyId: string, verified: boolean) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/companies/${companyId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ verified }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCompanies((prev) => prev.map((c) => (c._id === companyId ? updated : c)));
      }
    } catch (err) {
      console.error('Error verifying company:', err);
    }
  };

  const exportStudentDataCsv = () => {
    if (students.length === 0) return;

    const headers = ['RollNo', 'Name', 'Email', 'Branch', 'CGPA', 'Batch', 'Backlogs', 'Placed', 'PlacedCompany', 'PackageLPA'];
    const rows = students.map((s) => [
      `"${s.rollNo}"`,
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.branch}"`,
      s.cgpa,
      s.batch,
      s.backlogs,
      s.isPlaced ? 'Yes' : 'No',
      `"${s.placedCompany || 'N/A'}"`,
      s.placedPackage || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campus_students_placement_report_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPlacementAnalyticsSummary = () => {
    if (!analytics) return;
    const content = [
      'SMART PLACEMENT PORTAL - PLACEMENT CELL SUMMARY REPORT',
      `Date Generated: ${new Date().toLocaleDateString()}`,
      '',
      'OVERVIEW METRICS:',
      `Total Registered Students: ${analytics.overview.totalStudents}`,
      `Placed Candidates: ${analytics.overview.placedCount}`,
      `Placement Rate: ${analytics.overview.placementRate}%`,
      `Average CTC Package: ${analytics.overview.avgPackageLPA} LPA`,
      `Highest CTC Package: ${analytics.overview.highestPackageLPA} LPA`,
      `Total Recruitment Drives: ${analytics.overview.totalDrives}`,
      '',
      'DEPARTMENT-WISE PLACEMENT BREAKDOWN:',
      'Branch,Total,Placed,Placement Rate %,Avg CGPA',
      ...analytics.departmentData.map(
        (d) => `"${d.branch}",${d.total},${d.placed},${d.placementRate}%,${d.avgCgpa}`
      ),
      '',
      'CONVERSION FUNNEL STAGES:',
      `Applications: ${analytics.funnel.applied}`,
      `Shortlisted: ${analytics.funnel.shortlisted}`,
      `Interviewed: ${analytics.funnel.interview}`,
      `Selected/Offers: ${analytics.funnel.selected}`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `placement_analytics_summary_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (studentBranchFilter !== 'all' && s.branch !== studentBranchFilter) return false;
    if (studentPlacementFilter === 'placed' && !s.isPlaced) return false;
    if (studentPlacementFilter === 'unplaced' && s.isPlaced) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pendingDrives = drives.filter((d) => d.status === 'pending');
  const pendingCompanies = companies.filter((c) => !c.verified);

  return (
    <div className="space-y-6">
      {/* 1. Placement Analytics View */}
      {currentTab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* Top Row Overview Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Placement Rate</div>
              <div className="text-3xl font-extrabold text-blue-600 mt-1">{analytics.overview.placementRate}%</div>
              <div className="text-xs text-slate-500 mt-1">
                {analytics.overview.placedCount} of {analytics.overview.totalStudents} placed
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Average Package</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">{analytics.overview.avgPackageLPA}</div>
              <div className="text-xs text-slate-500 mt-1">LPA Annual CTC</div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Highest Package</div>
              <div className="text-3xl font-extrabold text-emerald-600 mt-1">{analytics.overview.highestPackageLPA}</div>
              <div className="text-xs text-slate-500 mt-1">LPA (Google SDE)</div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Campus Drives</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">{analytics.overview.totalDrives}</div>
              <div className="text-xs text-slate-500 mt-1">{analytics.overview.activeDrives} Approved & Active</div>
            </div>
          </div>

          {/* Department Breakdown & Conversion Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Wise Bar Graph Representation */}
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Department Placement Performance</h3>
                  <p className="text-xs text-slate-500">Placement percentage by engineering discipline</p>
                </div>
              </div>

              <div className="space-y-3.5 pt-2">
                {analytics.departmentData.map((dept) => (
                  <div key={dept.branch} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{dept.branch}</span>
                      <span className="font-bold text-blue-600">
                        {dept.placementRate}% ({dept.placed}/{dept.total})
                      </span>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, dept.placementRate)}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400">Avg CGPA: {dept.avgCgpa}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recruitment Conversion Funnel */}
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recruitment Conversion Funnel</h3>
                  <p className="text-xs text-slate-500">Candidate progression from application to selection</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    <span className="font-medium text-slate-700">1. Applications Submitted</span>
                  </div>
                  <strong className="text-slate-900 font-bold">{analytics.funnel.applied}</strong>
                </div>

                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span className="font-medium text-blue-900">2. Shortlisted for Assessments</span>
                  </div>
                  <strong className="text-blue-900 font-bold">{analytics.funnel.shortlisted}</strong>
                </div>

                <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <span className="font-medium text-indigo-900">3. Technical & HR Interviews</span>
                  </div>
                  <strong className="text-indigo-900 font-bold">{analytics.funnel.interview}</strong>
                </div>

                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-medium text-emerald-900">4. Final Offers (Placed)</span>
                  </div>
                  <strong className="text-emerald-900 font-bold">{analytics.funnel.selected}</strong>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={exportPlacementAnalyticsSummary}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report (CSV)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Approvals Queue View */}
      {currentTab === 'approvals' && (
        <div className="space-y-6">
          {/* Pending Drives Queue */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pending Drive Proposals ({pendingDrives.length})</h3>
                <p className="text-xs text-slate-500">Review eligibility rules and approve campus posting</p>
              </div>
            </div>

            {pendingDrives.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                All submitted recruitment drives have been reviewed and approved.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingDrives.map((drive) => (
                  <div key={drive._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{drive.role}</span>
                        <span className="text-xs text-slate-500">at {drive.companyName}</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        Package: <strong>{drive.ctc} LPA</strong> · Min CGPA: <strong>{drive.eligibility.cgpaMin}</strong> · Branches: {drive.eligibility.branches.join(', ')}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Deadline: {drive.deadline}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveDrive(drive._id, 'approved')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Drive</span>
                      </button>
                      <button
                        onClick={() => handleApproveDrive(drive._id, 'rejected')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Companies Queue */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pending Company Registrations ({pendingCompanies.length})</h3>
                <p className="text-xs text-slate-500">Verify company recruiters before allowing job drive creation</p>
              </div>
            </div>

            {pendingCompanies.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No company accounts pending verification.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingCompanies.map((comp) => (
                  <div key={comp._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={comp.logoUrl || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=120&h=120&q=80'}
                        alt={comp.name}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-100"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{comp.name}</div>
                        <div className="text-[11px] text-slate-500">{comp.industry} · {comp.email}</div>
                        {comp.website && (
                          <a href={comp.website} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 underline">
                            {comp.website}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVerifyCompany(comp._id, true)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Verify Company</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Student Master Directory View */}
      {currentTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative">
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search name, roll no..."
                  className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              </div>

              <select
                value={studentBranchFilter}
                onChange={(e) => {
                  setStudentBranchFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none"
              >
                <option value="all">All Branches</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">ECE</option>
                <option value="Mechanical Engineering">Mechanical</option>
                <option value="Electrical Engineering">Electrical</option>
              </select>

              <select
                value={studentPlacementFilter}
                onChange={(e) => {
                  setStudentPlacementFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="placed">Placed Only</option>
                <option value="unplaced">Seeking Placement</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setIsBulkImportOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Bulk Import (CSV)</span>
              </button>

              <button
                onClick={exportStudentDataCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Student Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Branch & Batch</th>
                    <th className="py-3 px-4">CGPA</th>
                    <th className="py-3 px-4">Backlogs</th>
                    <th className="py-3 px-4">Placement Status</th>
                    <th className="py-3 px-4">Skills</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        No students match the criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{s.name}</div>
                          <div className="text-[11px] text-slate-500">{s.rollNo} · {s.email}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {s.branch} ({s.batch})
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{s.cgpa}</td>
                        <td className="py-3 px-4">
                          {s.backlogs === 0 ? (
                            <span className="text-slate-400">0</span>
                          ) : (
                            <span className="text-rose-600 font-bold">{s.backlogs}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {s.isPlaced ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Placed
                              </span>
                              <div className="text-[11px] text-slate-500">
                                {s.placedCompany} ({s.placedPackage} LPA)
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-medium">Active Applicant</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {s.skills?.slice(0, 3).map((sk, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                  >
                    Previous
                  </button>
                  <span className="px-2 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Companies Master Directory View */}
      {currentTab === 'companies' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Registered Recruiters & Companies ({companies.length})</h3>
              <p className="text-xs text-slate-500">Master database of campus recruiting partners</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((comp) => {
              const compDrives = drives.filter((d) => d.companyId === comp._id);
              return (
                <div key={comp._id} className="p-4 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <img
                      src={comp.logoUrl || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=120&h=120&q=80'}
                      alt={comp.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-100"
                    />
                    <StatusBadge status={comp.verified ? 'Verified' : 'Unverified'} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{comp.name}</h4>
                    <p className="text-[11px] text-slate-500">{comp.industry}</p>
                  </div>
                  <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded flex items-center justify-between">
                    <span>Active Drives:</span>
                    <strong className="text-blue-600 font-bold">{compDrives.length}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImportComplete={loadAllData}
      />
    </div>
  );
};
