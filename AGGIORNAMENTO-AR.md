# Aggiornamento realtà aumentata (AR)

Questa versione aggiunge la visualizzazione del modello 3D direttamente nell'ambiente reale tramite la fotocamera dello smartphone.

## Cosa cambia

- Viewer basato su `<model-viewer>` di Google.
- AR Android tramite WebXR / Scene Viewer / ARCore.
- AR iPhone/iPad tramite Quick Look; `<model-viewer>` può generare automaticamente l'asset Quick Look dal GLB quando possibile.
- Pulsante **Visualizza nel tuo spazio** sui dispositivi compatibili.
- Posizionamento sul pavimento, adatto a macchinari industriali.
- Scala AR bloccata (`ar-scale="fixed"`) per evitare che il cliente ridimensioni il macchinario.
- Lettura automatica delle dimensioni del GLB e badge con ingombro rilevato.
- Lo stesso sistema funziona sia sui link pubblici `/p/...` sia sui link cliente `/s/...`.

## Requisito fondamentale per la scala reale

glTF/GLB usa metri: **1 unità = 1 metro**.

Esempio: una macchina larga 1,20 m deve risultare larga 1.20 unità nel GLB, non 1200 unità.

Se il CAD è in millimetri, durante l'esportazione GLB occorre convertire correttamente mm -> m. Il viewer mostra l'ingombro rilevato proprio per facilitare questo controllo.

## Test consigliato

1. Caricare un GLB dall'admin.
2. Aprire `/p/<slug>` da desktop e verificare le dimensioni visualizzate.
3. Aprire lo stesso link da Android o iPhone.
4. Toccare **Visualizza nel tuo spazio**.
5. Inquadrare il pavimento e posizionare il macchinario.
6. Confrontare una misura nota del macchinario con lo spazio reale.

## Compatibilità

- Android: dispositivi compatibili ARCore / Scene Viewer.
- iPhone/iPad: Quick Look AR.
- Desktop: viewer 3D normale; viene mostrato l'avviso di aprire il link da smartphone per l'AR.
