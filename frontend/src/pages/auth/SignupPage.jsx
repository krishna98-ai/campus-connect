
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AtSign,
  Loader2,
} from "lucide-react";

import { signupUser } from "../../store/authSlice";
import toast from "react-hot-toast";

export default function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    const newErrors = {};

    // Name
    if (!form.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Username
    if (!form.username.trim()) {
      newErrors.username = "Username is required";
    } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(form.username)) {
      newErrors.username =
        "3–30 chars, letters/numbers/underscore only";
    }

    // Email
    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Enter a valid email";
    }

    // Password
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "At least 8 characters";
    } else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(form.password)) {
      newErrors.password =
        "Include at least one uppercase letter and number";
    }

    // Confirm password
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const { confirmPassword, ...payload } = form;

    const result = await dispatch(signupUser(payload));

    if (signupUser.fulfilled.match(result)) {
      toast.success(
        "Account created! Welcome to Campus Connect 🎓"
      );

      navigate("/");
    } else {
      toast.error(result.payload || "Signup failed");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">
        Create account
      </h2>

      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Join thousands of students on Campus Connect
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        {/* Full Name */}
        <div>
          <label className="label">Full Name</label>

          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                handleChange("name", event.target.value)
              }
              placeholder="Your full name"
              className={`input-field pl-10 ${
                errors.name
                  ? "border-red-400 focus:ring-red-400"
                  : ""
              }`}
            />
          </div>

          {errors.name && (
            <p className="mt-1 text-xs text-red-500">
              {errors.name}
            </p>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="label">Username</label>

          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={form.username}
              onChange={(event) =>
                handleChange("username", event.target.value)
              }
              placeholder="cool_username"
              className={`input-field pl-10 ${
                errors.username
                  ? "border-red-400 focus:ring-red-400"
                  : ""
              }`}
            />
          </div>

          {errors.username && (
            <p className="mt-1 text-xs text-red-500">
              {errors.username}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="label">Email</label>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                handleChange("email", event.target.value)
              }
              placeholder="you@university.edu"
              className={`input-field pl-10 ${
                errors.email
                  ? "border-red-400 focus:ring-red-400"
                  : ""
              }`}
            />
          </div>

          {errors.email && (
            <p className="mt-1 text-xs text-red-500">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="label">Password</label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) =>
                handleChange("password", event.target.value)
              }
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              className={`input-field pl-10 pr-10 ${
                errors.password
                  ? "border-red-400 focus:ring-red-400"
                  : ""
              }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="mt-1 text-xs text-red-500">
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="label">Confirm Password</label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type={showPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(event) =>
                handleChange(
                  "confirmPassword",
                  event.target.value
                )
              }
              placeholder="Repeat password"
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
          className="btn-primary mt-2 w-full py-3 text-base"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-primary-600 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}