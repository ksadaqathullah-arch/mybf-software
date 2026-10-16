import { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = {
  title: 'Sign In | MYBF Workspace',
  description: 'Sign in to the Malappuram Youth Business Forum portal for members and chapter officers.',
};

export default function LoginPage() {
  return <LoginForm />;
}
