import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-2xl font-black">
          404
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            The page you are looking for does not exist or has been moved to another location.
          </p>
        </div>
        <div className="flex items-center justify-center space-x-3">
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            icon={Home}
            onClick={() => navigate('/')}
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
