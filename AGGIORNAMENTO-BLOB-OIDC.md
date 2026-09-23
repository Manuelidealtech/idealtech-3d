# Correzione Vercel Blob OIDC

Questa versione sostituisce il vecchio flusso client-token (`upload` + `handleUpload`) con il flusso presigned compatibile con OIDC (`uploadPresigned` + `handleUploadPresigned` + `issueSignedToken`).

## Requisiti Vercel
Lo store Blob deve essere collegato al progetto. Vercel aggiunge automaticamente `BLOB_STORE_ID` e `BLOB_WEBHOOK_PUBLIC_KEY` e fornisce il token OIDC alle Functions.

Non impostare `BLOB_READ_WRITE_TOKEN`.

## Deploy
1. Sostituire i file del progetto con questa versione, mantenendo `.git`, `.vercel` e `.env.local`.
2. `npm install`
3. `npm run build`
4. `git add .`
5. `git commit -m "Fix Vercel Blob OIDC presigned upload"`
6. `git push`

Dopo il deploy, aprire `/admin/products` e provare `Carica GLB`.
