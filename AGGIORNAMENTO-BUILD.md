# Fix build Supabase / Next.js

Questa versione evita qualsiasi accesso a Supabase durante il prerender di `next build`.
Le pagine che leggono dati reali chiamano `connection()` di Next.js e vengono quindi renderizzate a richiesta.

## Variabili Vercel consigliate

Impostare in Project -> Settings -> Environment Variables, almeno per Production e Preview:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `NEXT_PUBLIC_APP_URL=https://idealtech-3d.vercel.app`

Sono supportati anche i nomi legacy:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Non è necessario `BLOB_READ_WRITE_TOKEN` quando Vercel Blob è collegato al progetto via OIDC.

Dopo una modifica alle variabili d'ambiente eseguire un nuovo Redeploy.
