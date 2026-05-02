import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { Key, User as UserIcon, Palette, Sun, Moon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Settings = () => {
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [isKeyLoading, setIsKeyLoading] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    if (user) {
      setProfileForm({ name: user.name, email: user.email });
      fetchApiKeys();
    }
  }, [user]);

  const fetchApiKeys = async () => {
    try {
      const response = await api.get('/api-key');
      if (response.data && response.data.length > 0) {
        const activeKey = response.data.find((k: any) => k.status);
        if (activeKey || response.data.length > 0) setHasExistingKey(true);
      }
    } catch (error) {
      console.error("Failed to fetch API keys", error);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    if (user.name === profileForm.name && user.email === profileForm.email) return;
    try {
      const response = await api.put('/user/profile', profileForm);
      updateUser(response.data);
      toast({ title: 'Profile Saved', description: 'Your profile has been updated successfully.' });
    } catch (error: any) {
      toast({ title: 'Error Saving Profile', description: error.response?.data?.message || 'Could not save profile details.', variant: 'destructive' });
      setProfileForm({ name: user.name, email: user.email });
    }
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setIsKeyLoading(true);
    try {
      await api.post('/api-key', { api_key: apiKey, provider: 'groq' });
      toast({ title: 'API Key Saved', description: 'Your API key has been securely stored and validated.' });
      setApiKey('');
      setHasExistingKey(true);
    } catch (error: any) {
      toast({ title: 'Error Saving Key', description: error.response?.data?.error || 'Invalid API Key.', variant: 'destructive' });
    } finally {
      setIsKeyLoading(false);
    }
  };

  const toggleTheme = () => {
    const dark = document.documentElement.classList.contains('dark');
    if (dark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight mb-1">Settings</h1>
          <p className="text-[var(--text-secondary)]">Manage your profile, API keys, and preferences.</p>
        </motion.div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-xl bg-[var(--bg-secondary)] p-1 h-auto">
            <TabsTrigger value="profile" className="rounded-lg py-2 text-sm data-[state=active]:bg-[var(--card)] data-[state=active]:shadow-sm">
              <UserIcon className="h-4 w-4 mr-2" />Profile
            </TabsTrigger>
            <TabsTrigger value="api" className="rounded-lg py-2 text-sm data-[state=active]:bg-[var(--card)] data-[state=active]:shadow-sm">
              <Key className="h-4 w-4 mr-2" />API Keys
            </TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-lg py-2 text-sm data-[state=active]:bg-[var(--card)] data-[state=active]:shadow-sm">
              <Palette className="h-4 w-4 mr-2" />Appearance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-[var(--accent)]" /> Profile
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">Your account details</p>
              <form onSubmit={handleProfileSave} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Name</Label>
                  <Input name="name" value={profileForm.name} onChange={handleProfileChange} className="h-11 rounded-xl bg-[var(--bg-secondary)] border-[var(--border)]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email</Label>
                  <Input name="email" type="email" value={profileForm.email} onChange={handleProfileChange} className="h-11 rounded-xl bg-[var(--bg-secondary)] border-[var(--border)]" />
                </div>
                <Button type="submit" className="gradient-primary text-white rounded-xl h-10 shadow-sm hover:shadow-md transition-shadow">
                  Update Profile
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="api" className="mt-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                <Key className="h-5 w-5 text-[var(--accent)]" /> API Key
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">Configure your AI provider API key for enhanced analysis</p>
              <form onSubmit={handleSaveKey} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="text-sm font-medium">API Key</Label>
                  <Input id="apiKey" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={hasExistingKey ? "gsk_•••••••••••••••••••••" : "gsk_..."} className="h-11 rounded-xl bg-[var(--bg-secondary)] border-[var(--border)]" />
                </div>
                {hasExistingKey && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-[var(--text-secondary)]">Active API key configured</span>
                  </div>
                )}
                <Button type="submit" className="gradient-primary text-white rounded-xl h-10 shadow-sm hover:shadow-md transition-shadow" disabled={!apiKey.trim() || isKeyLoading}>
                  {isKeyLoading ? 'Saving...' : (hasExistingKey ? 'Update Key' : 'Save Key')}
                </Button>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="mt-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                <Palette className="h-5 w-5 text-[var(--accent)]" /> Appearance
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">Customize the look and feel</p>
              <div className="space-y-4 max-w-md">
                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    {isDark ? <Moon className="h-5 w-5 text-[var(--accent)]" /> : <Sun className="h-5 w-5 text-[var(--accent)]" />}
                    <div>
                      <p className="text-sm font-medium">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
                      <p className="text-xs text-[var(--text-secondary)]">Toggle between light and dark themes</p>
                    </div>
                  </div>
                  <button onClick={toggleTheme} className={`relative w-12 h-6 rounded-full transition-colors ${isDark ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}>
                    <motion.div animate={{ x: isDark ? 24 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
