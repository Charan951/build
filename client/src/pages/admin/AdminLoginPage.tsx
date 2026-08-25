import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '../../components/seo/SEOHead';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../services/api';

// Single role-based login: tries the admin/team credentials first, then falls
// back to client-portal credentials, so admins and clients share one page and
// land in the right place (dashboard vs. portal) without picking a role.
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
      const adminRes = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (adminRes.success) {
        localStorage.setItem('adminToken', adminRes.accessToken);
        navigate('/dashboard');
        return;
      }

      const clientRes = await apiFetch('/client-auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (clientRes.success) {
        localStorage.setItem('clientToken', clientRes.accessToken);
        localStorage.setItem('clientInfo', JSON.stringify(clientRes.client));
        navigate('/portal');
        return;
      }

      setErrorMsg(adminRes.message || clientRes.message || 'Invalid email or password.');
    } catch (err) {
      setErrorMsg('Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 flex items-center justify-center px-6">
      <SEOHead title="Login | Build Your Thoughts" />

      <Card className="w-full max-w-md p-10 space-y-8 bg-white border border-dark/10 shadow-2xl">
        <div className="text-center space-y-3">
          <img src="/logo.svg" alt="Build Your Thoughts" className="h-10 w-auto mx-auto" />
          <h1 className="font-display text-3xl font-bold text-dark">Sign In</h1>
          <p className="text-xs text-slateText">Admin team &amp; client portal access — Build Your Thoughts</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-form bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <FormField label="Email Address">
            {(fieldId) => (
              <div className="relative">
                <input
                  id={fieldId}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-form bg-background border border-dark/10 text-dark text-sm transition-colors focus:outline-none focus:border-dark focus-ring"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            )}
          </FormField>

          <FormField label="Password">
            {(fieldId) => (
              <div className="relative">
                <input
                  id={fieldId}
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-form bg-background border border-dark/10 text-dark text-sm transition-colors focus:outline-none focus:border-dark focus-ring"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            )}
          </FormField>

          <Button variant="lime" type="submit" disabled={loading} className="w-full font-bold">
            {loading ? 'Authenticating...' : 'Log In'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
