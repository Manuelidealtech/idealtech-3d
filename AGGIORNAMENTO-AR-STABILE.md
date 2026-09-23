# Fix AR stabile + scala CAD in millimetri

Questa versione risolve due problemi tipici dei modelli industriali derivati da STL/CAD:

1. **Unità STL in millimetri**: glTF/GLB e AR lavorano in metri. In admin l'unità predefinita è ora `Millimetri (CAD/STL)`. Durante l'upload il GLB viene modificato senza ricodificare le mesh: ogni scena riceve un nodo radice con scala `0.001`, quindi il file salvato su Blob è nativamente corretto anche per Scene Viewer e Quick Look.
2. **Salti/spostamenti del modello durante l'AR**: su Android viene data priorità a `Scene Viewer`, su iOS a `Quick Look`; WebXR resta fallback. Il flusso nativo è più adatto alla presentazione commerciale e al riposizionamento su pavimento.

## IMPORTANTE
I GLB già presenti su Blob non vengono modificati automaticamente. Dopo il deploy:

- entra in Admin > Prodotti 3D;
- lascia `Unità sorgente = Millimetri (CAD/STL)`;
- ricarica il GLB del prodotto;
- apri di nuovo il prodotto sul telefono e avvia AR.

Se un GLB è già stato esportato correttamente in metri, seleziona `Metri (GLB già corretto)` prima dell'upload.

Il viewer ora blocca l'avvio AR se rileva dimensioni evidentemente anomale (>100 m), per evitare che un file in mm venga inviato per errore all'AR nativa.
