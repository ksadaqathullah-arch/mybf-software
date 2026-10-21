import { Metadata } from 'next';
import { YouthRegistrationForm } from '@/features/memberships/components/youth-registration-form';

export const metadata: Metadata = {
  title: 'Youth Registration & Talent Discovery | MYBF',
  description:
    'Join 16 constituency chapters across Malappuram district. Official youth membership and talent discovery registration.',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-paper py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <YouthRegistrationForm asModal={false} />
      </div>
    </div>
  );
}
