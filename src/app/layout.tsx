import type { Metadata } from 'next';
import { Assistant } from 'next/font/google';
import './globals.css';

const assistant = Assistant({
  subsets: ['latin', 'hebrew'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-assistant',
});

export const metadata: Metadata = {
  title: 'WDI | מאתגר להצלחה',
  description: 'WDI - חברת בוטיק לניהול פרויקטים, פיקוח וייעוץ הנדסי',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={assistant.variable}>
      <body className="font-assistant antialiased">{children}</body>
    </html>
  );
}
