import React from 'react';
import {
  Briefcase,
  FileCheck2,
  User,
  PlusCircle,
  Users,
  Building,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { user, studentProfile, companyProfile } = useAuth();

  if (!user) return null;

  const role = user.role;

  let navItems: { id: string; label: string; icon: React.ReactNode; badge?: string | number }[] = [];

  if (role === 'student') {
    navItems = [
      { id: 'drives', label: 'Open Drives', icon: <Briefcase className="w-4 h-4" /> },
      { id: 'applications', label: 'My Applications', icon: <FileCheck2 className="w-4 h-4" /> },
      { id: 'profile', label: 'Profile & Resume', icon: <User className="w-4 h-4" /> },
    ];
  } else if (role === 'recruiter') {
    navItems = [
      { id: 'drives', label: 'Our Job Drives', icon: <Briefcase className="w-4 h-4" /> },
      { id: 'post-drive', label: 'Post New Drive', icon: <PlusCircle className="w-4 h-4" /> },
      { id: 'candidates', label: 'Applicant Pipeline', icon: <Users className="w-4 h-4" /> },
      { id: 'company-profile', label: 'Company Profile', icon: <Building className="w-4 h-4" /> },
    ];
  } else if (role === 'admin') {
    navItems = [
      { id: 'analytics', label: 'Placement Analytics', icon: <BarChart3 className="w-4 h-4" /> },
      { id: 'approvals', label: 'Approvals Queue', icon: <ShieldCheck className="w-4 h-4" /> },
      { id: 'students', label: 'Student Directory', icon: <Users className="w-4 h-4" /> },
      { id: 'companies', label: 'Companies Master', icon: <Building className="w-4 h-4" /> },
    ];
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-16 left-0 z-20 w-64 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 p-4 flex flex-col justify-between transition-transform duration-200 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* User Profile Mini Card */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="text-xs font-semibold text-slate-900 truncate">{user.name}</div>
            <div className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</div>

            {role === 'student' && studentProfile && (
              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">CGPA: <strong className="text-slate-800">{studentProfile.cgpa}</strong></span>
                <span className="text-slate-500">{studentProfile.branch.slice(0, 14)}</span>
              </div>
            )}

            {role === 'recruiter' && companyProfile && (
              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px]">
                <span className="text-slate-500">{companyProfile.name}</span>
                {companyProfile.verified ? (
                  <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium">Pending Approval</span>
                )}
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <div className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Dashboard Navigation
            </div>
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={active ? 'text-blue-600' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Policy Link */}
        <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-500 space-y-1 border border-slate-100">
          <div className="font-medium text-slate-700">Placement Cell (TPO)</div>
          <p className="text-[10px] leading-tight text-slate-400">
            Official 2025–26 recruitment drive guidelines enforced.
          </p>
        </div>
      </aside>
    </>
  );
};
