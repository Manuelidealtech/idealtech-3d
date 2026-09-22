import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Idealtech 3D Experience',
  description: 'Portale professionale per la presentazione interattiva dei prodotti Idealtech.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="it"><body>{children}</body></html>;
}
