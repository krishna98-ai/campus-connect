import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send reset email",
      );
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="animate-fade-in text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-9 w-9 text-green-600" />
        </div>

        <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
          Check your inbox
        </h2>

        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          We sent a password reset link to <strong>{email}</strong>. The link
          expires in 30 minutes.
        </p>

        <p className="mb-6 text-xs text-slate-400">
          Didn't get it? Check your spam folder or{" "}
          <button
            type="button"
            onClick={() => setSent(false)}
            className="font-medium text-primary-600 hover:underline"
          >
            try again
          </button>
          .
        </p>

        <Link to="/login" className="btn-secondary w-full justify-center">
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Link
        to="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-700 dark:hover:text-slate-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </Link>

      <h2 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">
        Forgot password?
      </h2>

      <p className="mb-8 text-sm text-slate-500 dark:text-slate-400">
        No worries. Enter your email and we'll send a reset link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label className="label">Email address</label>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              placeholder="you@university.edu"
              className={`input-field pl-10 ${
                error ? "border-red-400 focus:ring-red-400" : ""
              }`}
            />
          </div>

          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>
    </div>
  );
}
