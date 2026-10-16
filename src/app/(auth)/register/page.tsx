import { Metadata } from 'next';
import { YouthRegistrationForm } from '@/features/memberships/components/youth-registration-form';

export const metadata: Metadata = {
  title: 'Youth Registration & Talent Discovery | MYBF',
  description:
    'Join 16 constituency chapters across Malappuram district. Official youth membership and talent discovery registration.',
};

export default function RegisterPage() {
  return <YouthRegistrationForm />;
}
