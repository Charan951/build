import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '../../components/seo/SEOHead';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Sparkles, Lock, Mail, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../services/api';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.success) {
        localStorage.setItem('adminToken', data.accessToken);
        navigate('/dashboard');
      } else {
        setErrorMsg(data.message || 'Login failed.');
      }
    } catch (err) {
      setErrorMsg('Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 flex items-center justify-center px-6">
      <SEOHead title="Admin Login | Build Your Thoughts Headless CMS" />

      <Card className="w-full max-w-md p-10 space-y-8 bg-white border border-dark/10 shadow-2xl">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mx-auto text-dark">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="font-display text-3xl font-bold text-dark">CMS Admin Access</h1>
          <p className="text-xs text-slateText">Build Your Thoughts Management Portal</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-form bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-dark mb-2">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-form bg-background border border-dark/10 text-dark text-sm focus:outline-none focus:border-primary"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-dark mb-2">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-form bg-background border border-dark/10 text-dark text-sm focus:outline-none focus:border-primary"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <Button variant="lime" type="submit" disabled={loading} className="w-full font-bold">
            {loading ? 'Authenticating...' : 'Log In to CMS'}
          </Button>
        </form>

        <p className="text-center text-[11px] text-gray-400">
          Default seed login: <code className="text-dark">admin@buildyourthoughts.com</code> / <code className="text-dark">AdminPass123!</code>
        </p>
      </Card>
    </div>
  );
};
