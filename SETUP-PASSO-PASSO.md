# ATTIVAZIONE IDEALTECH 3D — PASSO PASSO

## 1. Verifica Node

In PowerShell:

```powershell
node -v
npm -v
```

Serve Node >= 20.9. Consigliato Node 22 LTS o superiore compatibile.

## 2. Testa subito il progetto

```powershell
npm install
npm run dev
```

Apri http://localhost:3000. La versione definitiva non include una modalità demo: Supabase e Vercel Blob devono essere configurati.

## 3. Crea progetto Supabase

1. Accedi a Supabase e crea un nuovo progetto, ad esempio `idealtech-3d`.
2. Apri **SQL Editor**.
3. Incolla tutto il file `sql/setup.sql` e premi **Run**.
4. Vai in **Project Settings > API** e recupera:
   - Project URL
   - anon / publishable key
   - service_role / secret key
5. Non esporre mai la service role nel browser o nel repository.

## 4. Crea l'account admin

1. Supabase > **Authentication > Users**.
2. **Add user > Create new user**.
3. Inserisci l'email dell'admin e una password forte.
4. Puoi creare più utenti admin: in questa prima versione tutti gli utenti autenticati hanno accesso al pannello.

## 5. Configura `.env.local`

Copia `.env.example` in `.env.local` e compila:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TUO-PROGETTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=LA_TUA_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=LA_TUA_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL=http://localhost:3000
BLOB_STORE_ID (gestito automaticamente da Vercel OIDC)=
```

Riavvia `npm run dev`. Ora `/admin` richiede login reale.

## 6. Crea repository GitHub

Dalla cartella progetto:

```powershell
git init
git add .
git commit -m "Initial Idealtech 3D portal"
git branch -M main
git remote add origin https://github.com/TUO-UTENTE/idealtech-3d.git
git push -u origin main
```

`.env.local` è già escluso da Git.

## 7. Importa il progetto su Vercel

1. Vercel > **Add New > Project**.
2. Seleziona il repository GitHub.
3. Framework rilevato: Next.js.
4. Inserisci nelle **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (inizialmente URL Vercel, poi dominio definitivo)
5. Deploy.

## 8. Crea Vercel Blob

1. Nel progetto Vercel apri **Storage**.
2. Crea/connetti uno store **Blob**.
3. Per questa versione usa uno store **Public**: il viewer riceve direttamente l'URL CDN del GLB.
4. Vercel collega automaticamente le credenziali al progetto.
5. Per lavorare in locale con Blob:

```powershell
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
```

Controlla che il pull non abbia cancellato le variabili Supabase; se necessario reinseriscile.

## 9. Primo modello 3D

1. Accedi a `/admin/login`.
2. Vai in **Prodotti 3D**.
3. Sul prodotto desiderato clicca **Carica GLB**.
4. Seleziona un `.glb`.
5. Il browser carica direttamente il file su Vercel Blob (multipart, adatto a file grandi).
6. Apri `/p/slug-prodotto` e verifica il viewer.

### Formato consigliato

Per il web usa GLB. Se ricevi STEP/IGES/CAD nativi, conviene esportare e ottimizzare in GLB prima della pubblicazione. Obiettivo pratico: file il più leggero possibile compatibilmente con la qualità.

## 10. Link clienti

- `/p/idm-gp` = pagina permanente pubblica, ideale per sito/QR/cataloghi.
- `/s/TOKEN` = link generato dall'admin, revocabile e con scadenza opzionale.

Nel menu **Link condivisi** scegli prodotto, etichetta e scadenza. Se lasci la scadenza vuota, il link resta attivo finché non lo revochi.

### Nota importante sulla sicurezza dei file

Questa release usa Blob pubblico per garantire semplicità e caricamento affidabile di GLB grandi. La scadenza protegge il **link applicativo**, non rende segreto l'URL CDN se qualcuno lo estrae dagli strumenti del browser.

Se i CAD 3D devono essere realmente riservati, il passo successivo è passare lo store a **Vercel Private Blob** e servire i modelli con signed URL a breve durata. L'architettura dati del portale è già compatibile con questa evoluzione.

## 11. Dominio consigliato

Esempi:

- `3d.idealtech.it`
- `experience.idealtech.it`

In Vercel > Domains aggiungi il sottodominio e configura il DNS indicato. Poi aggiorna:

```env
NEXT_PUBLIC_APP_URL=https://3d.idealtech.it
```

## 12. Checklist prima della consegna

- Login admin funzionante
- Nessuna chiave secret su GitHub
- GLB caricati e ottimizzati
- Viewer testato Chrome/Edge/Safari/mobile
- Link permanenti verificati
- Link temporanei: scadenza e revoca verificate
- Analytics registrano le visite
- Dominio e HTTPS attivi
- Backup dei file CAD originali mantenuto fuori dal portale
