import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ChatbotWidget } from './components/ChatbotWidget.tsx';
import { StudentDashboard } from './pages/StudentDashboard.tsx';
import { RecruiterDashboard } from './pages/RecruiterDashboard.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { UserRole } from './types.ts';

function AppContent() {
  const { user, loading } = useAuth();

  // Navigation tab state per dashboard
  const [studentTab, setStudentTab] = useState('drives');
  const [recruiterTab, setRecruiterTab] = useState('drives');
  const [adminTab, setAdminTab] = useState('analytics');

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [authModalRole, setAuthModalRole] = useState<UserRole>('student');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleOpenAuth = (tab: 'login' | 'register' = 'login', role: UserRole = 'student') => {
    setAuthModalTab(tab);
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };

  const getCurrentTab = () => {
    if (!user) return '';
    if (user.role === 'student') return studentTab;
    if (user.role === 'recruiter') return recruiterTab;
    if (user.role === 'admin') return adminTab;
    return '';
  };

  const handleSelectTab = (tab: string) => {
    if (!user) return;
    if (user.role === 'student') setStudentTab(tab);
    if (user.role === 'recruiter') setRecruiterTab(tab);
    if (user.role === 'admin') setAdminTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      <Navbar
        onOpenAuth={handleOpenAuth}
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {!user ? (
        <main className="flex-1">
          <LandingPage onOpenAuth={handleOpenAuth} />
        </main>
      ) : (
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Dashboard Sidebar */}
          <Sidebar
            currentTab={getCurrentTab()}
            onSelectTab={handleSelectTab}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />

          {/* Dashboard Main View Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
            {user.role === 'student' && <StudentDashboard currentTab={studentTab} />}
            {user.role === 'recruiter' && (
              <RecruiterDashboard
                currentTab={recruiterTab}
                onSelectTab={setRecruiterTab}
              />
            )}
            {user.role === 'admin' && <AdminDashboard currentTab={adminTab} />}
          </main>
        </div>
      )}

      {/* Floating AI Placement Copilot */}
      <ChatbotWidget />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
        defaultRole={authModalRole}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
