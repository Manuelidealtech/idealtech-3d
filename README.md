# Idealtech 3D Experience

Portale Next.js per presentazioni 3D professionali con catalogo pubblico, area admin, upload GLB su Vercel Blob, link cliente permanenti/temporanei e analytics.

## Avvio locale immediato

```bash
npm install
npm run dev
```

Apri `http://localhost:3000`. Il progetto usa esclusivamente il backend reale: configura Supabase prima di avviare le funzioni amministrative.

## Stack

- Next.js 16.3.5
- React 19.3.0
- Three.js 0.186.0 (senza react-three-fiber)
- Supabase Auth + Postgres
- Vercel Blob per i file GLB
- GitHub + Vercel per deploy

## Setup produzione

Segui `SETUP-PASSO-PASSO.md`.

## Realtà aumentata

La versione 1.1 integra `<model-viewer>` con AR WebXR / Scene Viewer / Quick Look. I modelli GLB vengono posizionati sul pavimento in scala reale 1:1 (`ar-scale="fixed"`). Perché la scala sia corretta, il GLB deve rispettare lo standard glTF: 1 unità = 1 metro. Vedi `AGGIORNAMENTO-AR.md`.
