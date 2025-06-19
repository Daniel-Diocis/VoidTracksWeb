# VoidTracksWeb

VoidTracksWeb è un'applicazione web per l'acquisto, la gestione e la riproduzione di brani musicali. 
Gli utenti possono registrarsi, acquistare token, scaricare brani tramite link temporanei e creare playlist personalizzate. 
Gli amministratori possono gestire gli utenti e ricaricare token.

## Rotte

La seguente tabella mostra le rotte:

| Metodo | Rotta                          | Parametri                          |
|--------|-------------------------------|----------------------------------|
| POST   | /auth/register                | username, password               |
| POST   | /auth/login                   | username, password               |
| GET    | /auth/private                 | token (header Authorization)    |
| POST   | /auth/logout                  | Nessuno                        |
| GET    | /tracks                       | Nessuno                         |
| GET    | /tracks/popular               | Nessuno                         |
| POST   | /purchase                    | token (header Authorization), track_id |
| GET    | /purchase/download/:download_token | download_token (route param)     |
| GET    | /purchase                    | token (header Authorization), fromDate?, toDate? (query) |
| GET    | /purchase/:download_token     | download_token (route param)     |
| GET    | /playlists                   | token (header Authorization)    |
| POST   | /playlists                   | token (header Authorization), nome |
| GET    | /playlists/:id               | token (header Authorization), id (route param) |
| DELETE | /playlists/:id               | token (header Authorization), id (route param) |
| PATCH  | /playlists/:id               | token (header Authorization), id (route param), nome |
| POST   | /playlists/:id/tracks        | token (header Authorization), id (route param), track_id |
| DELETE | /playlists/:id/tracks/:trackId | token (header Authorization), id (route param), trackId (route param) |
| PATCH  | /playlists/:id/favorite      | token (header Authorization), id (route param), trackId |
| PATCH  | /admin/recharge              | token (header Authorization), username, tokens |

## Funzionamento del Progetto

Di seguito viene descritto il funzionamento delle principali rotte API del progetto **VoidTracks**, con esempi di richieste, risposte e meccanismi sottostanti.

## POST: /auth/register

**Richiesta**

Il corpo della richiesta deve seguire il modello JSON:
```json
{
  "username": "nuovoutente",
  "password": "passwordsicura123!"
}
```

**Meccanismo**

Il meccanismo è il seguente:
- Il server verifica che username e password siano stati inseriti.
- Controlla che l’username non sia già in uso.
- Cripta la password con bcrypt.
- Crea un nuovo utente con ruolo user e saldo iniziale di token (10).
- Genera un token JWT contenente id, username, ruolo e token residui.
- Restituisce il token e i dati utente.

**Risposta in caso di successo**

La risposta restituisce il token e i dati utente.

```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 10,
    "username": "nuovoutente",
    "role": "user",
    "tokens": 10
  }
}
```

**Risposta in caso di errore**

Se manca username o password:
```json
{
  "error": "Username e password sono obbligatori"
}
```

Se username già esistente:
```json
{
  "error": "Username già in uso"
}
```

Altri errori di server:
```json
{
  "error": "Errore del server"
}
```

## POST: /auth/login

**Richiesta**

Il corpo della richiesta deve seguire il modello JSON:

```json
{
  "username": "nomeutente",
  "password": "passwordsegreta"
}
```

**Meccanismo**

Il meccanismo è il seguente:
- Il server verifica le credenziali.
- Se sono corrette, genera un token JWT firmato.
- Restituisce il token e alcuni dati base dell’utente (username e ruolo).

**Risposta in caso di successo**

In caso di successo la risposta restituisce un JSON con { token, user { id, user, role, tokens }.

```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "nomeutente",
    "role": "user",
    "tokens": 10
  }
}
```

**Risposta in caso di errore**

```json
{
  "error": "Credenziali non valide"
}
```

## GET:/auth/private
Questa rotta permette di ottenere i dati completi dell’utente autenticato, inclusi i token residui, inviando il token JWT nell’header di autorizzazione.

**Richiesta**

Non richiede un body, ma è necessario fornire il token JWT nell’header Authorization:

```javascript
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Meccanismo**

Il server verifica il token e, se valido, recupera dal database i dati completi dell’utente associato

**Risposta in caso di successo**

Se il token è valido, la risposta restituisce i dati completi dell’utente, ad esempio:

```json
{
  "user": {
    "id": 1,
    "username": "esempioUtente",
    "role": "user",
    "tokens": 10
  }
}
```
**Risposta in caso di errore**

In caso di errore (token mancante o scaduto), viene restituito un messaggio di errore con codice HTTP 401.

```json
{
  "error": "Token non valido o scaduto"
}
```

## POST:/auth/logout

Per effettuare il logout, non è necessario inviare un body nella richiesta.

**Meccaniscmo**
Il server conferma la disconnessione dell’utente. Il token JWT non viene invalidato lato server, quindi il client deve eliminare il token localmente per completare il logout.

**Risposta in caso di successo**

```json
{
  "message": "Logout eseguito con successo"
}
```

**Risposta in caso di errore**

In caso di errore (token mancante o scaduto), viene restituito un messaggio di errore con codice HTTP 401.

```json
{
  "error": "Token non valido o scaduto"
}
```
