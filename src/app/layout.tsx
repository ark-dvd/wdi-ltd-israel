import type { Metadata } from 'next';
import { Assistant, Heebo } from 'next/font/google';
import './globals.css';

const assistant = Assistant({
  subsets: ['hebrew'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-assistant',
});

const heebo = Heebo({
  subsets: ['hebrew'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-heebo',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wdi-israel.co.il';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'WDI | מאתגר להצלחה', template: '%s | WDI' },
  description: 'WDI - חברת בוטיק לניהול פרויקטים, פיקוח וייעוץ הנדסי בישראל. מומחים בניהול פרויקטי בנייה בטחוניים, מסחריים ותשתיות.',
  icons: {
    icon: [
      { url: '/images/favicon.png', type: 'image/png' },
      { url: '/images/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    locale: 'he_IL',
    type: 'website',
    siteName: 'WDI',
    url: SITE_URL,
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={`${assistant.variable} ${heebo.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="font-assistant antialiased">{children}</body>
    </html>
  );
}
