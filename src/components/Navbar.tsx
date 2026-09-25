import React, { useState } from 'react';
import {
  GraduationCap,
  Bell,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Building2,
  ShieldCheck,
  Check,
  Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../types.ts';

interface NavbarProps {
  onOpenAuth: (defaultTab?: 'login' | 'register', defaultRole?: UserRole) => void;
  onToggleSidebar?: () => void;
  currentTab?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onToggleSidebar }) => {
  const { user, logout, demoLogin, notifications, unreadCount, markNotificationRead } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'admin':
        return { label: 'Placement Officer (Admin)', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'recruiter':
        return { label: 'Company Recruiter', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'student':
        return { label: 'Student Candidate', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      default:
        return { label: 'Guest', color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const badge = getRoleBadge(user?.role);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand & Mobile Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {user && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                Smart Placement Portal
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Campus AI Recruitment</span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              title="Switch demo persona for testing"
            >
              <span className="text-slate-400">Switch Role:</span>
              <span className="font-semibold text-slate-900">
                {user?.role ? user.role.toUpperCase() : 'Select Role'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div
                className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setShowRoleMenu(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Test Personas (1-Click)
                </div>
                <button
                  onClick={() => {
                    demoLogin('student');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                    user?.role === 'student' ? 'text-blue-600 font-medium bg-blue-50/50' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-blue-500" />
                    <div>
                      <div>Student View</div>
                      <div className="text-[10px] text-slate-400">Priya Sharma (8.9 CGPA)</div>
                    </div>
                  </div>
                  {user?.role === 'student' && <Check className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => {
                    demoLogin('recruiter');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                    user?.role === 'recruiter' ? 'text-blue-600 font-medium bg-blue-50/50' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div>Recruiter View</div>
                      <div className="text-[10px] text-slate-400">Google Talent Team</div>
                    </div>
                  </div>
                  {user?.role === 'recruiter' && <Check className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => {
                    demoLogin('admin');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                    user?.role === 'admin' ? 'text-blue-600 font-medium bg-blue-50/50' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-500" />
                    <div>
                      <div>Placement Cell (TPO)</div>
                      <div className="text-[10px] text-slate-400">Approvals & Analytics</div>
                    </div>
                  </div>
                  {user?.role === 'admin' && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {user ? (
            <>
              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                  aria-label="View notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                  )}
                </button>

                {showNotifications && (
                  <div
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setShowNotifications(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900">Notifications</span>
                      <span className="text-[10px] text-slate-400">{unreadCount} unread</span>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">No notifications yet.</div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                              !n.read ? 'bg-blue-50/40' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between font-medium text-slate-800">
                              <span>{n.title}</span>
                              {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                            <span className="text-[9px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Pill & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800">{user.name}</div>
                  <div className="text-[10px] text-slate-500">{badge.label}</div>
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
