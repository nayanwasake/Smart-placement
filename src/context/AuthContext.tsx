import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile, CompanyProfile, AppNotification, UserRole } from '../types.ts';

interface AuthContextType {
  user: User | null;
  studentProfile: StudentProfile | null;
  companyProfile: CompanyProfile | null;
  token: string | null;
  loading: boolean;
  notifications: AppNotification[];
  unreadCount: number;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; name: string; role: UserRole; details?: any }) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateStudentProfile: (updates: Partial<StudentProfile>) => Promise<StudentProfile | null>;
  markNotificationRead: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('spp_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const fetchCurrentUser = async (jwtToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setStudentProfile(data.studentProfile || null);
        setCompanyProfile(data.companyProfile || null);
        fetchNotifications(jwtToken);
      } else {
        // Token invalid
        localStorage.removeItem('spp_token');
        setToken(null);
        setUser(null);
        setStudentProfile(null);
        setCompanyProfile(null);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async (jwtToken: string) => {
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }
      localStorage.setItem('spp_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setStudentProfile(data.studentProfile || null);
      setCompanyProfile(data.companyProfile || null);
      fetchNotifications(data.token);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: { email: string; password: string; name: string; role: UserRole; details?: any }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register');
      }
      localStorage.setItem('spp_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setStudentProfile(data.studentProfile || null);
      setCompanyProfile(data.companyProfile || null);
      fetchNotifications(data.token);
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role: UserRole) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Demo login failed');
      }
      localStorage.setItem('spp_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setStudentProfile(data.studentProfile || null);
      setCompanyProfile(data.companyProfile || null);
      fetchNotifications(data.token);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('spp_token');
    setToken(null);
    setUser(null);
    setStudentProfile(null);
    setCompanyProfile(null);
    setNotifications([]);
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchCurrentUser(token);
    }
  };

  const updateStudentProfile = async (updates: Partial<StudentProfile>) => {
    if (!token) return null;
    try {
      const res = await fetch('/api/students/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setStudentProfile(updated);
        return updated;
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
    return null;
  };

  const markNotificationRead = async (id: string) => {
    if (!token) return;
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        studentProfile,
        companyProfile,
        token,
        loading,
        notifications,
        unreadCount,
        login,
        register,
        demoLogin,
        logout,
        refreshProfile,
        updateStudentProfile,
        markNotificationRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
