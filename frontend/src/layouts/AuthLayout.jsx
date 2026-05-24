import { Outlet, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-brand flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl">Campus Connect</span>
        </Link>

        <div className="text-white space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Your campus community,<br />all in one place.
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Connect with classmates, share notes, discover campus events, and chat in real time.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { label: 'Students', value: '10K+' },
              { label: 'Notes Shared', value: '50K+' },
              { label: 'Colleges', value: '200+' },
              { label: 'Daily Posts', value: '5K+' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-white/70 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/50 text-sm">© {new Date().getFullYear()} Campus Connect. All rights reserved.</p>
      </div>

      {/* Right auth form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-slate-900">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white">Campus Connect</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
