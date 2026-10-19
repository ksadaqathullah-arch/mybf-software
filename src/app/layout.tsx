import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'MYBF - Malappuram Youth Business Forum | An Initiative Under Mission Malappuram 2050',
  description:
    'Malappuram Youth Business Forum (MYBF), an initiative under Mission Malappuram 2050. The integrated digital operating system empowering youth and women entrepreneurship, AI-driven business leadership, and 16 founding chapters across Kerala.',
  keywords: [
    'MYBF',
    'Malappuram Youth Business Forum',
    'Mission Malappuram 2050',
    'Mission 2050 Malappuram',
    'Youth Entrepreneurship',
    'Women Entrepreneurship',
    'AI-Driven Business Leadership',
    'Malappuram Business Community',
    'Startup Ecosystem',
    'Entrepreneurship Development',
    'Malappuram Chapters',
  ],
  authors: [{ name: 'MYBF Secretariat in collaboration with Mission Malappuram 2050' }],
  creator: 'Malappuram Youth Business Forum (MYBF)',
  publisher: 'Mission Malappuram 2050',
  icons: {
    icon: '/logos/mybf-logo.png',
    apple: '/logos/mybf-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#FBFDFD] dark:bg-[#030405] text-slate-900 dark:text-slate-100`}>
        {children}
      </body>
    </html>
  );
}
