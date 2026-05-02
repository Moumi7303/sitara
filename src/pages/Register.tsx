import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { Brain, Loader2, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string()
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-green-400'];
  const strengthLabels = ['', 'Weak', 'Medium', 'Strong'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = registerSchema.safeParse({ name, email, password, password_confirmation: passwordConfirm });
    if (!result.success) {
      toast({ title: 'Validation Error', description: result.error.errors[0].message, variant: 'destructive' });
      setIsLoading(false);
      return;
    }
    try {
      const response = await api.post('/auth/register', { name, email, password, password_confirmation: passwordConfirm });
      const { user, token } = response.data;
      setAuth(user, token);
      toast({ title: 'Success', description: 'Account created successfully!' });
      navigate('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast({ title: 'Registration Failed', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[var(--bg-secondary)]">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 dot-pattern opacity-[0.03]" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[var(--accent)]/10 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-[120px] animate-float" style={{ animationDelay: '3s' }} />
        <div className="relative flex flex-col justify-center px-16 z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-12">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-heading font-bold">Sitara<span className="text-[var(--accent)]">.</span></span>
          </Link>
          <h2 className="text-3xl font-heading font-bold mb-4 leading-tight">
            Start making<br /><span className="gradient-text">smarter decisions</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed max-w-md">
            Create your free account and get access to AI-powered decision analysis instantly.
          </p>
          <div className="mt-12 space-y-4">
            {['Free to start, no credit card', 'Instant AI-powered analysis', 'Secure & encrypted data'].map((item, i) => (
              <motion.div key={item} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                <div className="h-5 w-5 rounded-full bg-[var(--accent-soft)] flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-[var(--accent)]" />
                </div>
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[400px]">
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center"><Brain className="h-5 w-5 text-white" /></div>
              <span className="text-2xl font-heading font-bold">Sitara<span className="text-[var(--accent)]">.</span></span>
            </Link>
          </div>
          <div className="mb-8">
            <h1 className="text-2xl font-heading font-bold mb-2">Create your account</h1>
            <p className="text-[var(--text-secondary)]">Start making smarter decisions today</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Name</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" disabled={isLoading} className="pl-10 h-11 rounded-xl bg-[var(--bg-secondary)] border-[var(--border)]" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" disabled={isLoading} className="pl-10 h-11 rounded-xl bg-[var(--bg-secondary)] border-[var(--border)]" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={isLoading} className="pl-10 h-11 rounded-xl bg-[var(--bg-secondary)] border-[var(--border)]" />
              </div>
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((level) => (
                      <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength >= level ? strengthColors[passwordStrength] : 'bg-[var(--border)]'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-[var(--text-secondary)]">{strengthLabels[passwordStrength]}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm" className="text-sm font-medium">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
                <Input id="passwordConfirm" type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="••••••••" disabled={isLoading} className="pl-10 h-11 rounded-xl bg-[var(--bg-secondary)] border-[var(--border)]" />
              </div>
            </div>
            <Button type="submit" className="w-full gradient-primary text-white rounded-xl h-11 shadow-sm hover:shadow-md transition-all gap-2" disabled={isLoading}>
              {isLoading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Creating Account...</>) : (<>Create Account <ArrowRight className="h-4 w-4" /></>)}
            </Button>
          </form>
          <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
