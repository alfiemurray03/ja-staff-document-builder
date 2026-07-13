import React, { createContext, useContext, useMemo, useState } from 'react';

export interface StaffProfile {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  company: 'JA Group Services Ltd' | 'JSDS Group Ltd';
  department: string;
  email: string;
  initials: string;
  defaultBranding: string;
  preferredLayout: string;
  plan: 'professional';
}

const STORAGE_KEY = 'ja-development-staff-profile';
const defaultProfile: StaffProfile = {
  id: 'development-staff',
  displayName: import.meta.env.VITE_STAFF_DISPLAY_NAME || 'Development Staff User',
  firstName: 'Development',
  lastName: 'User',
  jobTitle: import.meta.env.VITE_STAFF_JOB_TITLE || 'Staff Member',
  company: (import.meta.env.VITE_STAFF_COMPANY === 'JSDS Group Ltd' ? 'JSDS Group Ltd' : 'JA Group Services Ltd'),
  department: import.meta.env.VITE_STAFF_DEPARTMENT || 'Operations',
  email: import.meta.env.VITE_STAFF_EMAIL || 'staff@example.invalid',
  initials: 'DU',
  defaultBranding: 'company-default',
  preferredLayout: 'professional',
  plan: 'professional',
};

interface StaffContextValue {
  user: StaffProfile;
  isLoading: false;
  updateProfile: (updates: Partial<StaffProfile>) => void;
  refreshUser: () => void;
  logout: () => void;
}

const StaffContext = createContext<StaffContextValue | null>(null);

/**
 * DEVELOPMENT ONLY: this local profile provides convenience, not identity,
 * authentication, authorisation or any other security boundary.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StaffProfile>(() => {
    try { return { ...defaultProfile, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
    catch { return defaultProfile; }
  });
  const value = useMemo<StaffContextValue>(() => ({
    user,
    isLoading: false,
    updateProfile: (updates) => setUser((current) => {
      const next = { ...current, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    }),
    refreshUser: () => undefined,
    logout: () => { window.location.href = '/dashboard'; },
  }), [user]);
  return <StaffContext.Provider value={value}>{children}</StaffContext.Provider>;
}

export function useAuth() {
  const context = useContext(StaffContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
