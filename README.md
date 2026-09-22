# Idealtech 3D Experience

Portale Next.js per presentazioni 3D professionali con catalogo pubblico, area admin, upload GLB su Vercel Blob, link cliente permanenti/temporanei e analytics.

## Avvio locale immediato

```bash
npm install
npm run dev
```

Apri `http://localhost:3000`. Senza `.env.local` il progetto parte in **modalità demo**: puoi già vedere catalogo, viewer e dashboard.

## Stack

- Next.js 16.3.5
- React 19.3.0
- Three.js 0.186.0 (senza react-three-fiber)
- Supabase Auth + Postgres
- Vercel Blob per i file GLB
- GitHub + Vercel per deploy

## Setup produzione

Segui `SETUP-PASSO-PASSO.md`.
