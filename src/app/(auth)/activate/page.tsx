import * as React from 'react';
import { ActivationForm } from '@/features/auth/components/activation-form';

export const metadata = {
  title: 'Activate Account | MYBF Malappuram Youth Business Forum',
  description: 'Complete your approved MYBF membership account activation and choose your username and password.',
};

export default function ActivatePage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <React.Suspense fallback={
          <div className="text-center p-8 text-xs text-slate-400">Loading activation interface...</div>
        }>
          <ActivationForm />
        </React.Suspense>
      </div>
    </div>
  );
}
