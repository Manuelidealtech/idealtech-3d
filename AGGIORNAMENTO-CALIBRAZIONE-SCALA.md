# Calibrazione reale GLB / AR

Questa versione elimina l'assunzione fissa `mm -> m = 0,001`.

Gli STL non dichiarano una unità standard e il software che genera il GLB può modificare la scala. Per questo il portale ora:

1. misura automaticamente l'ingombro del GLB selezionato;
2. chiede le tre dimensioni reali complessive del macchinario in millimetri;
3. confronta le tre misure senza dipendere dall'ordine degli assi;
4. calcola un unico fattore di scala uniforme;
5. verifica che le proporzioni corrispondano (tolleranza 8%);
6. incorpora il fattore direttamente nel GLB prima del caricamento su Vercel Blob.

La correzione è quindi effettiva anche in Scene Viewer / Quick Look, non solo nel viewer web.

Dopo l'aggiornamento è necessario ricaricare i GLB che mostravano dimensioni errate.
