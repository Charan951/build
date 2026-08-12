import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '../../components/seo/SEOHead';
import { Shield, Loader2 } from 'lucide-react';
import { apiFetch } from '../../services/api';

export const ClientLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    apiFetch('/client-auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password }),
    })
      .then((res) => {
        if (res.success) {
          localStorage.setItem('clientToken', res.accessToken);
          localStorage.setItem('clientInfo', JSON.stringify(res.client));
          navigate('/portal');
        } else {
          setError(res.message || 'Invalid credentials.');
        }
      })
      .catch((err) => setError('Error connecting to server: ' + err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <SEOHead title="Client Portal Login | Build Your Thoughts" />
      <div className="w-full max-w-sm bg-white rounded-card border border-dark/10 shadow-glass p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-11 h-11 rounded-2xl bg-dark flex items-center justify-center text-primary mx-auto">
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="font-display text-xl font-bold text-dark">Client Portal</h1>
          <p className="text-xs text-slateText">Sign in with the credentials emailed to you.</p>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-dark mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm focus:outline-none focus:border-dark"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-dark mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 bg-background border border-dark/10 rounded-xl text-sm focus:outline-none focus:border-dark"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-[#bce63b] text-dark font-bold text-sm shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
