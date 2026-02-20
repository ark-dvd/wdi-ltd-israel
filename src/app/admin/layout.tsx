/**
 * Admin root layout — minimal wrapper.
 * Auth check is in the (panel) route group layout.
 * This layout must NOT check auth so /admin/login works without redirect loops.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
