import { useState, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AtSign,
  Loader2
} from 'lucide-react';

import { signupUser } from '../../store/authSlice';
import toast from 'react-hot-toast';

const Field = memo(function Field({
  label,
  value,
  onChange,
  icon: Icon,
  type = 'text',
  placeholder,
  error,
  right
}) {
  return (
    <div>
      <label className="label">{label}</label>

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input-field ${
            Icon ? 'pl-10' : ''
          } ${right ? 'pr-10' : ''} ${
            error ? 'border-red-400 focus:ring-red-400' : ''
          }`}
        />

        {right}
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
});

export default function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: '',
    }));
  };

  const validate = () => {
    const e = {};

    if (!form.name.trim()) {
      e.name = 'Full name is required';
    } else if (form.name.trim().length < 2) {
      e.name = 'Name must be at least 2 characters';
    }

    if (!form.username.trim()) {
      e.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(form.username)) {
      e.username =
        '3–30 chars, letters/numbers/underscore only';
    }

    if (!form.email) {
      e.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      e.email = 'Enter a valid email';
    }

    if (!form.password) {
      e.password = 'Password is required';
    } else if (form.password.length < 8) {
      e.password = 'At least 8 characters';
    } else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(form.password)) {
      e.password =
        'Include at least one uppercase letter and number';
    }

    if (!form.confirmPassword) {
      e.confirmPassword =
        'Please confirm your password';
    } else if (
      form.password !== form.confirmPassword
    ) {
      e.confirmPassword = 'Passwords do not match';
    }

    setErrors(e);

    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const { confirmPassword, ...payload } = form;

    const result = await dispatch(signupUser(payload));

    if (signupUser.fulfilled.match(result)) {
      toast.success(
        'Account created! Welcome to Campus Connect 🎓'
      );

      navigate('/');
    } else {
      toast.error(
        result.payload || 'Signup failed'
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
        Create account
      </h2>

      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
        Join thousands of students on Campus Connect
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        <Field
          label="Full Name"
          value={form.name}
          onChange={(e) =>
            updateField('name', e.target.value)
          }
          icon={User}
          placeholder="Your full name"
          error={errors.name}
        />

        <Field
          label="Username"
          value={form.username}
          onChange={(e) =>
            updateField('username', e.target.value)
          }
          icon={AtSign}
          placeholder="cool_username"
          error={errors.username}
        />

        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) =>
            updateField('email', e.target.value)
          }
          icon={Mail}
          placeholder="you@university.edu"
          error={errors.email}
        />

        <div>
          <label className="label">
            Password
          </label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={(e) =>
                updateField(
                  'password',
                  e.target.value
                )
              }
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              className={`input-field pl-10 pr-10 ${
                errors.password
                  ? 'border-red-400 focus:ring-red-400'
                  : ''
              }`}
            />

            <button
              type="button"
              onClick={() =>
                setShowPass((p) => !p)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPass ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password}
            </p>
          )}
        </div>

        <div>
          <label className="label">
            Confirm Password
          </label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type={showPass ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) =>
                updateField(
                  'confirmPassword',
                  e.target.value
                )
              }
              placeholder="Repeat password"
              className={`input-field pl-10 ${
                errors.confirmPassword
                  ? 'border-red-400 focus:ring-red-400'
                  : ''
              }`}
            />
          </div>

          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 text-base mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-primary-600 font-semibold hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}