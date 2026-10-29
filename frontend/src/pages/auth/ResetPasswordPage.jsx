import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Loader2, CheckCircle2 } from "lucide-react";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "At least 8 characters";
    } else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(form.password)) {
      newErrors.password = "Include uppercase and number";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });

    setErrors({
      ...errors,
      [field]: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await api.put(`/auth/reset-password/${token}`, {
        password: form.password,
      });

      setDone(true);
      toast.success("Password reset successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Reset failed. Link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="animate-fade-in text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-9 w-9 text-green-600" />
        </div>

        <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
          Password reset!
        </h2>

        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Your password has been updated successfully.
        </p>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="btn-primary w-full justify-center py-3"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">
        Set new password
      </h2>

      <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
        Create a strong new password for your account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* New Password */}
        <div>
          <label className="label">New Password</label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) => handleChange("password", event.target.value)}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              className={`input-field pl-10 pr-10 ${
                errors.password ? "border-red-400 focus:ring-red-400" : ""
              }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="label">Confirm New Password</label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type={showPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(event) =>
                handleChange("confirmPassword", event.target.value)
              }
              placeholder="Repeat new password"
              className={`input-field pl-10 ${
                errors.confirmPassword
                  ? "border-red-400 focus:ring-red-400"
                  : ""
              }`}
            />
          </div>

          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </div>
  );
}
