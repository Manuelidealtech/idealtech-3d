# Fix calibrazione input italiani

Correzione della finestra **Calibrazione scala 1:1**:

- accetta numeri in formato italiano, ad esempio `1.723,69`;
- accetta anche `1723,69` e `1723.69`;
- gli errori vengono mostrati direttamente dentro la modale;
- durante la calibrazione e l'upload viene mostrato uno stato visibile con spinner e percentuale;
- il pulsante mostra `Attendi…` mentre l'operazione è in corso.

Il problema precedente era il parsing di valori come `1.723,69`: il codice sostituiva solo la virgola e produceva `1.723.69`, quindi il numero risultava non valido. L'errore veniva mostrato dietro la modale e sembrava che l'interfaccia fosse bloccata.
