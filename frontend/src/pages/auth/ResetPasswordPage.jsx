import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'At least 8 characters';
    else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(form.password)) e.password = 'Include uppercase and number';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password: form.password });
      setDone(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="animate-fade-in text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-9 h-9 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Password reset!</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Your password has been updated successfully.</p>
        <button onClick={() => navigate('/login')} className="btn-primary w-full justify-center py-3">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Set new password</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Create a strong new password for your account.</p>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label className="label">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }); }}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
            <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="label">Confirm New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPass ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) => { setForm({ ...form, confirmPassword: e.target.value }); setErrors({ ...errors, confirmPassword: '' }); }}
              placeholder="Repeat new password"
              className={`input-field pl-10 ${errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}
