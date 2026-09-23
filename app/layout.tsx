import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Idealtech 3D Experience',
    template: '%s · Idealtech 3D',
  },
  description: 'Portale professionale per la presentazione interattiva dei prodotti Idealtech.',
  icons: {
    icon: '/idealtech-logo.png',
    shortcut: '/idealtech-logo.png',
    apple: '/idealtech-logo.png',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="it"><body>{children}</body></html>;
}
