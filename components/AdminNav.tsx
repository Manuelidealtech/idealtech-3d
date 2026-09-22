import Link from 'next/link';
import { Logo } from './Logo';

export default function AdminNav() {
  return (
    <aside className="adminSidebar">
      <Logo />
      <nav>
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/products">Prodotti 3D</Link>
        <Link href="/admin/shares">Link condivisi</Link>
        <Link href="/admin/analytics">Statistiche</Link>
        <Link href="/" target="_blank">Apri portale pubblico ↗</Link>
      </nav>
      <form action="/api/auth/logout" method="post" className="logoutForm">
        <button type="submit" className="ghostBtn">Esci</button>
      </form>
    </aside>
  );
}
