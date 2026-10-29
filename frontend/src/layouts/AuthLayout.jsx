
import { Outlet, Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const stats = [
  { label: "Students", value: "10K+" },
  { label: "Notes Shared", value: "50K+" },
  { label: "Colleges", value: "200+" },
  { label: "Daily Posts", value: "5K+" },
];

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Desktop branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-brand p-12 lg:flex">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>

          <span className="text-xl font-bold text-white">
            Campus Connect
          </span>
        </Link>

        <div className="space-y-6 text-white">
          <h1 className="text-4xl font-bold leading-tight">
            Your campus community,
            <br />
            all in one place.
          </h1>

          <p className="text-lg leading-relaxed text-white/80">
            Connect with classmates, share notes, discover campus events,
            and chat in real time.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/10 p-4"
              >
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-white/70">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-white/50">
          © {new Date().getFullYear()} Campus Connect. All rights reserved.
        </p>
      </div>

      {/* Auth pages */}
      <div className="flex flex-1 items-center justify-center bg-white p-6 dark:bg-slate-900">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>

            <span className="text-xl font-bold text-slate-900 dark:text-white">
              Campus Connect
            </span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}