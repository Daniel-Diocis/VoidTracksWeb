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
  "username": "nuovoUtente",
  "password": "nuovaPassword"
}
```

**Meccanismo**

Il meccanismo è il seguente:
- Valida i dati ricevuti (username e password).
- Verifica che l’username non sia già registrato.
- Applica un hash sicuro alla password tramite bcrypt.
- Crea un nuovo utente con ruolo user e saldo iniziale di token (10).
- Genera un token JWT contenente id, username, ruolo e token residui.
- Restituisce il token e i dati utente.

**Diagramma di sequenza**

Il meccanismo che si innesca all'atto della chiamata è descritto dal seguente diagramma:

```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant App
  participant Middleware
  participant Controller
  participant DB
  participant JWTService

  Client->>App: POST /auth/register (username, password)
  App->>Middleware: validateAuthInput
  Middleware-->>App: next() o 400 error
  App->>Middleware: checkUserExists
  Middleware->>DB: findOne({ username })
  DB-->>Middleware: null or user
  Middleware-->>App: next() o 409 error
  App->>Controller: register(req)
  Controller->>DB: create({ username, password_hash, tokens, role })
  DB-->>Controller: newUser
  Controller->>JWTService: sign({ id, username, role, tokens })
  JWTService-->>Controller: token
  Controller->>App: status: res.status(201)
  Controller->>App: result: res.json({ token, user })
  App->>Client: status: 201 Created
  App->>Client: result: { token, user }
```

**Risposta in caso di successo**

La risposta restituisce il token e i dati utente.

```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 10,
    "username": "nuovoUtente",
    "role": "user",
    "tokens": 10
  }
}
```

**Risposta in caso di errore**

Se username o password sono assenti o non validi, viene restituito un errore con codice **400** e una lista di messaggi strutturati:

```json
{
  "errors": [
    {
      "msg": "Username obbligatorio, almeno 3 caratteri",
      "param": "username",
      "location": "body"
    },
    {
      "msg": "Password obbligatoria, almeno 6 caratteri",
      "param": "password",
      "location": "body"
    }
  ]
}
```
Se solo uno dei due campi è errato, la risposta conterrà solo l’errore corrispondente.

Se l'username fornito è già presente nel database, viene restituito un errore con codice **409** e un messaggio descrittivo:

```json
{
  "error": "Username già in uso"
}
```

Per altri errori lato server viene restituito un errore con codice **500** e un messaggio generico:
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
  "username": "nuovoUtente",
  "password": "nuovaPassword"
}
```

**Meccanismo**

Il meccanismo è il seguente:
- Valida i dati ricevuti (username e password).
- Verifica che l’utente esista e che la password corrisponda.
- Se le credenziali sono corrette, genera un token JWT firmato.
- Restituisce il token e i dati dell’utente (id, username, ruolo e saldo token).

**Diagramma di sequenza**

Il meccanismo che si innesca all'atto della chiamata è descritto dal seguente diagramma:

```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant App
  participant Middleware
  participant Controller
  participant DB
  participant Bcrypt
  participant JWTService

  Client->>App: POST /auth/login (username, password)
  App->>Middleware: validateAuthInput
  Middleware-->>App: next() o 400 error
  App->>Middleware: checkUserCredentials
  Middleware->>DB: findOne({ username })
  DB-->>Middleware: null or user
  Middleware->>Bcrypt: compare(password, user.password_hash)
  Bcrypt-->>Middleware: true or false
  Middleware-->>App: next() with userRecord or 401 error
  App->>Controller: login(req)
  Controller->>JWTService: sign({ id, username, role, tokens })
  JWTService-->>Controller: token
  Controller->>App: status: res.status(200)
  Controller->>App: result: res.json({ token, user })
  App->>Client: status: 200 OK
  App->>Client: result: { token, user }
```

**Risposta in caso di successo**

In caso di credenziali corrette, viene restituito un JSON con codice 200 OK contenente un token JWT e i dati dell’utente autenticato:

```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "nuovoUtente",
    "role": "user",
    "tokens": 10
  }
}
```

**Risposta in caso di errore**

Se username o password sono assenti o non validi, viene restituito un errore con codice **400** e una lista di messaggi strutturati:

```json
{
  "errors": [
    {
      "msg": "Username obbligatorio, almeno 3 caratteri",
      "param": "username",
      "location": "body"
    },
    {
      "msg": "Password obbligatoria, almeno 6 caratteri",
      "param": "password",
      "location": "body"
    }
  ]
}
```
Se solo uno dei due campi è errato, la risposta conterrà solo l’errore corrispondente.

Se le credenziali non sono valide (username inesistente o password errata), viene restituito un errore con codice **401** e un messaggio descrittivo:
```json
{
  "error": "Credenziali non valide"
}
```

Per altri errori lato server viene restituito un errore con codice **500** e un messaggio generico:
```json
{
  "error": "Errore del server"
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

Il meccanismo è il seguente:
- Verifica il token JWT fornito nell’header.
- Se il token è valido, recupera dal database i dati dell’utente associato.
- Se l’utente non ha ancora ricevuto il bonus giornaliero, assegna un token aggiuntivo e aggiorna la data.
- Restituisce i dati aggiornati dell’utente come risposta.

**Diagramma di sequenza**

Il meccanismo che si innesca all'atto della chiamata è descritto dal seguente diagramma:

```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant App
  participant MiddlewareAuthToken
  participant MiddlewareDailyBonus
  participant Controller
  participant DB

  Client->>App: GET /auth/private (Authorization: Bearer JWT)
  App->>MiddlewareAuthToken: authenticateToken
  MiddlewareAuthToken->>JWTService: verify(token)
  JWTService-->>MiddlewareAuthToken: payload or error
  MiddlewareAuthToken->>App: next() with user payload
  App->>MiddlewareDailyBonus: dailyTokenBonus
  MiddlewareDailyBonus->>DB: findByPk(user.id)
  DB-->>MiddlewareDailyBonus: user
  MiddlewareDailyBonus->>DB: update tokens if needed
  MiddlewareDailyBonus->>App: next() with userRecord
  App->>Controller: getPrivateUser(req)
  Controller->>App: response(user data)
  App->>Client: response(user data)
```

**Risposta in caso di successo**

In caso di token valido, viene restituito un JSON con i dati aggiornati dell’utente:

```json
{
  "user": {
    "id": 1,
    "username": "nuovoUtente",
    "role": "user",
    "tokens": 11
  }
}
```
**Risposta in caso di errore**

Se il token è mancante o non valido, viene restituito un errore con codice **401**:

```json
{
  "error": "Token mancante"
}
```

oppure:

```json
{
  "error": "Token non valido o scaduto"
}
```

Se l’utente non viene trovato nel database, viene restituito un errore con codice **404**:

```json
{
  "error": "Utente non trovato"
}
```

Per altri errori lato server viene restituito un errore con codice **500** e un messaggio generico:

```json
{
  "error": "Errore del server"
}
```

## GET: /tracks

Restituisce l’elenco di tutti i brani presenti nel database, eventualmente filtrati da una query testuale su titolo, artista o album.

**Richiesta**

Non richiede body.
Accetta un parametro di query facoltativo:
```http
GET /tracks?q=nome
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware validateTrackQuery verifica che il parametro q, se presente, sia una stringa.
- Il middleware logTrackRequest stampa su console eventuali ricerche effettuate.
- Il controller getAllTracks costruisce una clausola di ricerca condizionale.
- Interroga il database per ottenere i brani corrispondenti.
- Restituisce l’elenco in formato JSON.

**Diagramma di sequenza**

Il meccanismo che si innesca all'atto della chiamata è descritto dal seguente diagramma:

```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant App
  participant MiddlewareValidate
  participant MiddlewareLog
  participant Controller
  participant DB

  Client->>App: GET /tracks?q=nome
  App->>MiddlewareValidate: validateTrackQuery
  MiddlewareValidate-->>App: next()
  App->>MiddlewareLog: logTrackRequest
  MiddlewareLog-->>App: next()
  App->>Controller: getAllTracks(req)
  Controller->>DB: Track.findAll({ where: ... })
  DB-->>Controller: lista brani
  Controller->>App: res.status(200)
  Controller->>App: res.json(tracks)
  App->>Client: status: 200 OK
  App->>Client: result: lista brani
```

**Risposta in caso di successo**

Viene restituito un array JSON contenente i brani disponibili:

```json
[
  {
    "id": "ef90cefb-ea88-4c87-b61c-cab9c92653cd",
    "titolo": "Antes",
    "artista": "C.R.O",
    "album": "Rock",
    "music_path": "C.R.O - Antes.mp3",
    "cover_path": "C.R.O - Rock.jpg",
    "costo": 1,
    "createdAt": "2025-06-17T13:43:00.000Z",
    "updatedAt": "2025-06-17T13:43:00.000Z"
  },
  ...
]
```

**Risposta in caso di errore**

Se viene effettuata una ricerca tramite il parametro q, ma il valore fornito non è una stringa valida, il server restituisce un errore con codice **400**:

```json
{
  "error": "Il parametro 'q' deve essere una stringa"
}
```

Per altri errori lato server viene restituito un errore con codice **500** e un messaggio generico:
```json
{
  "error": "Errore del server"
}
```

## GET: /tracks/popular

Restituisce i 10 brani più acquistati, ordinati in base al numero di acquisti in ordine decrescente.

**Richiesta**

Non richiede body né parametri.
```http
GET /tracks/popular
```

**Meccanismo**

Il meccanismo è il seguente:
- Il controller getPopularTracks interroga la tabella Purchase, raggruppando i risultati per track_id.
- Conta il numero di acquisti per ciascun brano.
- Include i dati del brano dalla tabella Track.
- Ordina i risultati in ordine decrescente in base al numero di acquisti.
- Restituisce l’elenco in formato JSON.

**Diagramma di sequenza**

Il meccanismo che si innesca all'atto della chiamata è descritto dal seguente diagramma:

```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant App
  participant Controller
  participant DB

  Client->>App: GET /tracks/popular
  App->>Controller: getPopularTracks()
  Controller->>DB: Purchase.findAll({ include: Track, count, group... })
  DB-->>Controller: lista top tracks
  Controller->>App: res.status(200)
  Controller->>App: res.json(topTracks)
  App->>Client: status: 200 OK
  App->>Client: result: brani popolari
```

**Risposta in caso di successo**

Viene restituito un array JSON con i brani più acquistati e il numero di acquisti per ciascuno:

```json
[
  {
    "track_id": "ef90cefb-ea88-4c87-b61c-cab9c92653cd",
    "num_acquisti": "5",
    "Track": {
      "id": "ef90cefb-ea88-4c87-b61c-cab9c92653cd",
      "titolo": "Antes",
      "artista": "C.R.O",
      "album": "Rock",
      "cover_path": "C.R.O - Rock.jpg"
    }
  },
  ...
]
```

**Risposta in caso di errore**

In caso di errore interno del server, viene restituito un errore con codice **500** e un messaggio generico:
```json
{
  "error": "Errore del server"
}
```
