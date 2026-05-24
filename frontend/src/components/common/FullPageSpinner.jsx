import { GraduationCap } from 'lucide-react';

export default function FullPageSpinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-900 gap-4">
      <div className="w-14 h-14 bg-gradient-brand rounded-2xl flex items-center justify-center animate-bounce">
        <GraduationCap className="w-8 h-8 text-white" />
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary-500 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
