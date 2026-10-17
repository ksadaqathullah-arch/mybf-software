import { Metadata } from 'next';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';

export const metadata: Metadata = {
  title: 'Reset Password | MYBF Malappuram Youth Business Forum',
  description: 'Recover or reset your MYBF account password with verified membership credentials.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
