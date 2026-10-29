import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { verifySignupOtp } from "../../store/authSlice";

export default function VerifyOtpPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading } = useSelector((state) => state.auth);

  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email missing. Please sign up again.");
      navigate("/signup", { replace: true });
      return;
    }

    if (!/^\d{4}$/.test(otp)) {
      toast.error("Please enter the complete 4-digit OTP.");
      return;
    }

    const result = await dispatch(verifySignupOtp({ email, otp }));

    if (verifySignupOtp.fulfilled.match(result)) {
      toast.success("Email verified successfully!");
      navigate("/", { replace: true });
    } else {
      toast.error(result.payload || "Invalid or expired OTP.");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/30">
        <ShieldCheck className="h-7 w-7" />
      </div>

      <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
        Verify your email
      </h2>

      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        We've sent a 4-digit verification code to{" "}
        <strong>{email || "your email"}</strong>. Enter it below to activate
        your Campus Connect account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="otp" className="label">
            Verification code
          </label>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={4}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="Enter 4-digit OTP"
              className="input-field pl-10 text-center text-lg tracking-[0.5em]"
              required
            />
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            The code expires in 10 minutes. Check your spam folder if you cannot
            find the email.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 4}
          className="btn-primary flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Wrong email or code expired?{" "}
        <Link
          to="/signup"
          className="font-semibold text-primary-600 hover:underline"
        >
          Sign up again
        </Link>
      </p>

      <p className="mt-3 text-center text-sm">
        <Link to="/login" className="text-primary-600 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
