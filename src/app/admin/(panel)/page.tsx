/**
 * Admin panel page — DOC-030 §3
 * Server component that passes session email to the client shell.
 */
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { AdminShell } from '@/components/admin/AdminShell';

export default async function AdminPanelPage() {
  const session = await getServerSession(authOptions);
  return <AdminShell userEmail={session?.user?.email ?? ''} />;
}
