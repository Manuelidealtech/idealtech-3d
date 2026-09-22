import AdminNav from '@/components/AdminNav';
import { requireAdmin } from '@/lib/auth';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <div className="adminShell"><AdminNav /><section className="adminContent">{children}</section></div>;
}
