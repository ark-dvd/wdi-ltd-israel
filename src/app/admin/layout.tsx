/**
 * Admin root layout — applies Heebo font for backoffice (DOC-070).
 * Auth check is in the (panel) route group layout.
 * This layout must NOT check auth so /admin/login works without redirect loops.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="font-heebo">{children}</div>;
}
