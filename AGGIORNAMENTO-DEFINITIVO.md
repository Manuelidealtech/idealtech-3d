# Idealtech 3D — passaggio alla modalità definitiva

Questa versione NON contiene più la modalità demo.

## Backend richiesto
In Vercel devono essere presenti, per Production (e Preview se vuoi usare le preview):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL=https://idealtech-3d.vercel.app` (oppure il dominio definitivo)

## Vercel Blob
Lo store Blob deve essere collegato al progetto `idealtech-3d`.
La configurazione moderna usa OIDC: non serve `BLOB_READ_WRITE_TOKEN` in produzione.
Dopo aver collegato lo store o modificato le variabili, esegui sempre un nuovo deployment.

## Aggiornamento del repository
Sostituisci i file del progetto locale con quelli di questo ZIP, mantenendo esclusi `.git` e `.env.local`.
Poi:

```powershell
npm install
npm run dev
```

Se è tutto corretto:

```powershell
git add .
git commit -m "Definitive backend mode and Idealtech branding"
git push
```

Vercel farà il deployment automatico dalla branch `main`.

## Login admin
La versione corrente considera amministratori gli utenti presenti in Supabase Auth che effettuano login correttamente.
Per sicurezza, non esporre alcuna funzione di registrazione pubblica e mantieni in Supabase Auth solo gli account amministrativi autorizzati.

## Test dopo il deploy
1. `/admin/login` → login reale Supabase.
2. `/admin/products` → devono comparire i prodotti presenti in `public.products`.
3. `Carica GLB` → upload su Vercel Blob con OIDC.
4. `/p/<slug>` → il modello deve aprirsi nel viewer.
5. `/admin/shares` → genera un link cliente e aprilo in navigazione anonima.
6. `/admin/analytics` → dopo l'apertura di un prodotto deve aumentare il contatore.
