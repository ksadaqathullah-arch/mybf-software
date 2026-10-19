import { getCurrentActor } from '@/server/auth/session';
import { DistrictAdminService } from '@/features/district-admin/server/district-admin.service';
import { DistrictFinanceView } from '@/features/district-admin/components/district-finance-view';

export const dynamic = 'force-dynamic';

export default async function DistrictFinancePage() {
  const actor = await getCurrentActor();
  if (!DistrictAdminService.isAuthorizedDistrictAdmin(actor)) return null;

  const finance = await DistrictAdminService.getDistrictFinance(actor!);

  return <DistrictFinanceView finance={finance} />;
}
