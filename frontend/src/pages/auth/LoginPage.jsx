import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { loginUser } from "../../store/authSlice";
import toast from "react-hot-toast";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      newErrors.email = "Enter a valid email";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const credentials = {
      email: form.email.trim().toLowerCase(),
      password: form.password,
    };

    const result = await dispatch(loginUser(credentials));

    if (loginUser.fulfilled.match(result)) {
      toast.success("Welcome back!");
      navigate("/");
      return;
    }

    const errorMessage = String(result.payload || "Login failed");

    if (errorMessage.toLowerCase().includes("verify your email")) {
      toast.error("Please verify your email to continue.");

      navigate("/verify-otp", {
        state: { email: credentials.email },
      });
      return;
    }

    toast.error(errorMessage);
  };

  return (
    <div className="animate-fade-in">
      <h2 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">
        Welcome back
      </h2>

      <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
        Sign in to your Campus Connect account
      </p>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label className="label">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="you@university.edu"
              className={`input-field pl-10 ${
                errors.email ? "border-red-400" : ""
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="label mb-0">Password</label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-primary-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="Your password"
              className={`input-field pl-10 pr-10 ${
                errors.password ? "border-red-400" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
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

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 text-base"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <strong>Demo:</strong> admin@campusconnect.com / Admin@12345
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold text-primary-600 hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
