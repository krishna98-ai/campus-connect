import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gradient-brand rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-elevated">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-8xl font-black text-gradient mb-4">404</h1>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Page not found</h2>
        <p className="text-slate-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary inline-flex">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
