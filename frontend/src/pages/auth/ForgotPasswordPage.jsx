import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address'); return; }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="animate-fade-in text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-9 h-9 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check your inbox</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          We sent a password reset link to <strong>{email}</strong>. The link expires in 30 minutes.
        </p>
        <p className="text-xs text-slate-400 mb-6">Didn't get it? Check your spam folder or{' '}
          <button onClick={() => setSent(false)} className="text-primary-600 hover:underline font-medium">try again</button>.
        </p>
        <Link to="/login" className="btn-secondary w-full justify-center">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to login
      </Link>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Forgot password?</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
        No worries. Enter your email and we'll send a reset link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label className="label">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="you@university.edu"
              className={`input-field pl-10 ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
}
