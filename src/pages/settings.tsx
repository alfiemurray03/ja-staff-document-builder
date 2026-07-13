import { useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { useTheme, type ThemeMode } from '@/lib/theme-context';
import { useSiteSettings } from '@/lib/site-settings-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { siteName } = useSiteSettings();
  const [profile, setProfile] = useState(user);
  const [saved, setSaved] = useState(false);
  const set = (field: keyof typeof profile, value: string) => setProfile(current => ({ ...current, [field]: value }));

  return <>
    <Helmet><title>Staff Account — {siteName}</title></Helmet>
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div><h1 className="text-2xl font-bold">Staff Account</h1><p className="text-sm text-muted-foreground">Internal profile, document defaults and interface preferences.</p></div>
        <Card><CardHeader><CardTitle>Staff profile</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
          {([['displayName','Display name'],['jobTitle','Job title'],['department','Department'],['email','Work email address']] as const).map(([field,label]) => <div key={field}><Label>{label}</Label><Input value={profile[field]} onChange={e => set(field,e.target.value)} /></div>)}
          <div><Label>Default company profile</Label><Select value={profile.company} onValueChange={value => set('company',value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="JA Group Services Ltd">JA Group Services Ltd</SelectItem><SelectItem value="JSDS Group Ltd">JSDS Group Ltd</SelectItem></SelectContent></Select></div>
          <div><Label>Preferred document layout</Label><Select value={profile.preferredLayout} onValueChange={value => set('preferredLayout',value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="professional">Professional</SelectItem><SelectItem value="compact">Compact</SelectItem><SelectItem value="formal">Formal</SelectItem></SelectContent></Select></div>
          <div><Label>Interface theme</Label><Select value={theme} onValueChange={value => setTheme(value as ThemeMode)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem><SelectItem value="system">System</SelectItem></SelectContent></Select></div>
          <div className="sm:col-span-2 flex items-center gap-3"><Button onClick={() => { updateProfile(profile); setSaved(true); }}>Save staff settings</Button>{saved && <span className="text-sm text-emerald-600">Settings saved locally.</span>}</div>
        </CardContent></Card>
        <p className="text-xs text-amber-700">Development profile only. This is not authentication or a security control.</p>
      </div>
    </DashboardLayout>
  </>;
}
