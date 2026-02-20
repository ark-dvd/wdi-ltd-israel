import { redirect } from 'next/navigation';

/** Admin root redirects to CRM Dashboard per DOC-010 §2.2 */
export default function AdminPage() {
  redirect('/admin/dashboard');
}
