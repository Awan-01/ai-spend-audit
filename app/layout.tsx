import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AI Spend Audit | Stop Overpaying For AI Tools',
  description: 'Instantly audit your startup\'s AI tool subscriptions and API spend. Consolidate duplications, downgrade overprovisioned seats, and unlock up to 40% immediate SaaS cost savings.',
  keywords: ['AI Spend Audit', 'SaaS Optimization', 'ChatGPT savings', 'Claude Pro audit', 'LLM cost reduction', 'startup budget optimizer'],
  authors: [{ name: 'AISpendAudit Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-gray-950 text-gray-150">
        <Navbar />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
        <Footer />
        
        {/* Container for toasts */}
        <div id="custom-toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none" />
      </body>
    </html>
  );
}
