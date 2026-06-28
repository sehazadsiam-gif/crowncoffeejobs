import './globals.css';

export const metadata = {
  title: 'Crown Coffee — Career',
  description: 'Join the Crown Coffee team. Apply for Kitchen or Front Service positions.',
  icons: { icon: '/logo.png' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#F5F0E8',
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}

