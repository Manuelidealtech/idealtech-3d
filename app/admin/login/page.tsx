import { Logo } from '@/components/Logo';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return <main className="loginPage"><div className="loginCard"><Logo /><div className="loginIntro"><span className="eyebrow">AREA RISERVATA</span><h1>Idealtech 3D Admin</h1><p>Gestione modelli, link e statistiche del portale.</p></div><LoginForm /></div></main>;
}
