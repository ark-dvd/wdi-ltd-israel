/**
 * Panel layout — server-side auth gate (DOC-010 §2.2)
 * Redirects unauthenticated users to /admin/login.
 * Only pages inside (panel) require authentication.
 */
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/admin/login');
  }

  return <>{children}</>;
}
