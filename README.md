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
  Middleware-->>App: next()

  App->>Middleware: checkUserExists
  Middleware->>DB: User.findOne({ where: { username } })
  DB-->>Middleware: null
  Middleware-->>App: next()

  App->>Controller: register(req)
  Controller->>DB: User.create({ username, password_hash, tokens, role })
  DB-->>Controller: newUser

  Controller->>JWTService: sign({ id, username, role, tokens })
  JWTService-->>Controller: token

  Controller-->>App: token e user

  App->>Client: status: res.status(201)
  App->>Client: res: res.json({ token, user })
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
      "msg": "Bad Request: Username obbligatorio, almeno 3 caratteri",
      "param": "username",
      "location": "body"
    },
    {
      "msg": "Bad Request: Password obbligatoria, almeno 6 caratteri",
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
  "error": "Conflict: Username già in uso"
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
  Middleware-->>App: next()

  App->>Middleware: checkUserCredentials
  Middleware->>DB: findOne({ where: { username } })
  DB-->>Middleware: user
  Middleware->>Bcrypt: compare(password, user.password_hash)
  Bcrypt-->>Middleware: true
  Middleware-->>App: next()

  App->>Controller: login(req)
  Controller->>JWTService: sign({ id, username, role, tokens })
  JWTService-->>Controller: token
  Controller-->>App: token firmato

  App->>Client: res.status(200)
  App->>Client: res.json({ token, user })
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
      "msg": "Bad Request: Username obbligatorio, almeno 3 caratteri",
      "param": "username",
      "location": "body"
    },
    {
      "msg": "Bad Request: Password obbligatoria, almeno 6 caratteri",
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
  "error": "Unauthorized: Credenziali non valide"
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
  participant Middleware
  participant JWTService
  participant DB
  participant Controller

  Client->>App: GET /auth/private (Authorization: Bearer JWT)

  App->>Middleware: authenticateToken
  Middleware->>JWTService: verify(token)
  JWTService-->>Middleware: payload
  Middleware-->>App: next()

  App->>Middleware: dailyTokenBonus
  Middleware->>DB: User.findByPk(user.id)
  DB-->>Middleware: user
  Middleware->>DB: User.update() se bonus giornaliero
  DB-->>Middleware: user aggiornato
  Middleware-->>App: next()

  App->>Controller: getPrivateUser(req)
  Controller-->>App: dati utente

  App->>Client: res.status(200)
  App->>Client: res.json(dati utente)
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
  "error": "Unauthorized: Token mancante"
}
```

oppure:

```json
{
  "error": "Unauthorized: Token non valido o scaduto"
}
```

Se l’utente non viene trovato nel database, viene restituito un errore con codice **404**:

```json
{
  "error": "Not Found: Utente non trovato"
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
  participant Middleware
  participant Controller
  participant DB

  Client->>App: GET /tracks?q=nome
  App->>Middleware: validateTrackQuery
  Middleware-->>App: next()

  App->>Middleware: logTrackRequest
  Middleware-->>App: next()

  App->>Controller: getAllTracks(req)
  Controller->>DB: Track.findAll({ where: ... })
  DB-->>Controller: lista brani
  Controller-->>App: next()

  App->>Client: res.status(200)
  App->>Client: res.json(tracks)
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
  "error": "Bad Request: Il parametro 'q' deve essere una stringa"
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
  Controller->>DB: Purchase.findAll({ include: Track, group, count... })
  DB-->>Controller: lista top tracks
  Controller-->>App: next()

  App->>Client: res.status(200)
  App->>Client: res.json(topTracks)
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

## POST /purchase

Permette a un utente autenticato di acquistare un brano. Se l’utente ha già acquistato il brano e il link è ancora valido (entro 10 minuti dall'acquisto), viene restituito lo stesso download_token. In caso contrario, viene effettuato un nuovo acquisto e scalati i token all’utente.

**Richiesta**

Richiede token JWT nel header Authorization.
Richiede un corpo JSON contenente l’identificativo del brano:
```http
POST /purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "track_id": "ef90cefb-ea88-4c87-b61c-cab9c92653cd"
}
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware authenticateToken verifica l’identità dell’utente.
- I middleware validatePurchaseBody, checkUserAndTrackExist, checkDuplicatePurchase, checkUserTokens:
  - Validano l’input (track_id).
  - Controllano che l’utente e il brano esistano nel database.
  - Verificano se esiste già un acquisto valido (non scaduto e non ancora utilizzato).
  - Controllano che l’utente abbia abbastanza token.
- Il controller createPurchase:
  - Scala il costo del brano dai token dell’utente.
  - Registra l’acquisto con un download_token valido per 10 minuti.
  - Restituisce il token per il download.

**Diagramma di sequenza**

Il meccanismo che si innesca all'atto della chiamata è descritto dal seguente diagramma:

```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant App
  participant Middleware
  participant DB
  participant Controller

  Client->>App: POST /purchase (track_id)

  App->>Middleware: authenticateToken
  Middleware-->>App: next()

  App->>Middleware: validatePurchaseBody
  Middleware-->>App: next()

  App->>Middleware: checkUserAndTrackExist
  Middleware->>DB: User.findByPk + Track.findByPk
  DB-->>Middleware: entità trovate
  Middleware-->>App: next()

  App->>Middleware: checkDuplicatePurchase
  Middleware->>DB: cerca acquisto valido
  DB-->>Middleware: nessun acquisto valido
  Middleware-->>App: next()

  App->>Middleware: checkUserTokens
  Middleware-->>App: next()

  App->>Controller: createPurchase()
  Controller->>DB: scala token e crea acquisto
  DB-->>Controller: conferma acquisto
  Controller-->>App: download_token

  App->>Client: res.status(201)
  App->>Client: res.json({ download_token })
```

**Risposta in caso di successo**

Se l’utente possiede abbastanza token e non ha un acquisto ancora valido per il brano, il sistema registra l’acquisto e restituisce un download_token valido per 10 minuti:
```json
{
  "message": "Acquisto completato con successo",
  "purchase_id": "e1987d04-0c87-4825-b4a7-5c20574e93aa",
  "download_token": "92c1ec33-c59d-47df-89a9-c18d4e81e7fc"
}
```

Se l’utente ha già acquistato il brano e il relativo download_token è ancora valido (cioè non è scaduto e non è stato ancora utilizzato), il sistema non effettua un nuovo acquisto, ma restituisce lo stesso download_token:
```json
{
  "message": "Acquisto già presente e valido",
  "purchase_id": "8c2e945c-37d4-4e70-964f-7b5c16c3f16e",
  "download_token": "1955eaf0-bdc6-4cbf-8e97-b2df798ed7d1"
}
```

**Risposte in caso di errore**

Se il token è mancante o non valido, viene restituito un errore con codice **401**:

```json
{
  "error": "Unauthorized: Token mancante"
}
```

oppure:

```json
{
  "error": "Unauthorized: Token non valido o scaduto"
}
```

Se il campo track_id è mancante o non è una stringa valida, il server restituisce un errore con codice **400**:
```json
{
  "error": "Bad Request: Il campo 'track_id' è obbligatorio e deve essere una stringa"
}
```

Se l’utente autenticato non possiede un numero sufficiente di token per acquistare il brano richiesto, viene restituito un errore con codice **401**:
```json
{
  "error": "Unauthorized: Token insufficienti per l'acquisto"
}
```

Se l’utente indicato nel token non è presente nel database, oppure il brano con l’ID fornito non esiste, il server restituisce un errore con codice **404**. Il messaggio specifica l’elemento mancante:
```json
{
  "error": "Not Found: Utente non trovato"
}
```
oppure
```json
{
  "error": "Not Found: Brano non trovato"
}
```

Per altri errori lato server viene restituito un errore con codice **500** e un messaggio generico:

```json
{
  "error": "Errore del server"
}
```

## GET: /purchase/download/:download_token

Permette di scaricare il file audio associato a un acquisto, utilizzando un token temporaneo di download. Il token è valido solo se esiste, non è scaduto e non è ancora stato utilizzato.

**Richiesta**

Non richiede autenticazione né body. L’accesso avviene tramite il parametro :download_token nella route:
```http
GET /purchase/download/1955eaf0-bdc6-4cbf-8e97-b2df798ed7d1
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware validateDownloadToken:
  - Cerca nella tabella Purchase una riga con download_token corrispondente.
  - Controlla che il token esista.
  - Verifica che non sia già stato utilizzato (used_flag false).
  - Verifica che non sia scaduto (valid_until > now).
  - Se tutto è valido, allega l’oggetto purchaseInstance alla richiesta.
- Il controller downloadTrack:
  - Segna l’acquisto come utilizzato (used_flag = true) e lo salva.
  - Costruisce l’URL al file musicale.
  - Scarica il file da Supabase con axios (responseType: stream).
  - Imposta gli header HTTP per forzare il download del file audio.
  - Usa response.data.pipe(res) per inviare il file al client.

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
  participant Supabase

  Client->>App: GET /purchase/download/:download_token
  App->>Middleware: validateDownloadToken
  Middleware->>DB: Purchase.findOne({ include: [Track] })
  DB-->>Middleware: acquisto trovato
  Middleware->>Middleware: verifica scadenza e uso
  Middleware-->>App: next()

  App->>Controller: downloadTrack(req)
  Controller->>Controller: purchase.used_flag = true
  Controller->>DB: purchase.save()
  DB-->>Controller: conferma salvataggio
  Controller->>Supabase: GET fileUrl (stream)
  Supabase-->>Controller: audio stream
  Controller->>App: res.setHeader(...)
  Controller->>App: response.data.pipe(res)
  App-->>Client: avvio download file audio
```

**Risposta in caso di successo**

Il server restituisce il file audio come allegato da scaricare, ad esempio:
```http
Status: 200 OK
Content-Disposition: attachment; filename="Antes.mp3"
Content-Type: audio/mpeg
```
Il campo `Content-Disposition` forza il download del file con nome suggerito, mentre `Content-Type` indica che si tratta di un file audio MP3.

**Risposta in caso di errore**

Se il token non esiste, è scaduto o già utilizzato, il server risponde come segue:

Token non trovato:
```json
{
  "error": "Not Found: Link di download non valido"
}
```

Token già utilizzato:
```json
{
  "error": "Not Found: Link già utilizzato"
}
```

Token scaduto:
```json
{
  "error": "Not Found: Link scaduto"
}
```

Per altri errori lato server viene restituito un errore con codice **500** e un messaggio generico:

```json
{
  "error": "Errore del server"
}
```

## GET: /purchase

Recupera la lista di tutti gli acquisti effettuati dall’utente autenticato. È possibile applicare filtri opzionali per data (fromDate e toDate) tramite query string. La rotta è protetta da autenticazione JWT.

**Richiesta**

La richiesta deve contenere un token JWT valido nell’header Authorization:
```http
GET /purchase?fromDate=2024-06-01&toDate=2024-06-30
Authorization: Bearer <JWT>
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware authenticateToken verifica l’identità dell’utente.
- Il controller getUserPurchases:
  - Estrae l’id dell’utente da req.user.
  - Applica eventuali filtri fromDate e toDate sulla colonna purchased_at.
  - Interroga il database con filtro e include i dati del brano acquistato (Track).
  - Ordina i risultati in ordine decrescente per data.
  - Restituisce una risposta JSON con la lista degli acquisti.

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

  Client->>App: GET /purchase?fromDate=...&toDate=... (Authorization: Bearer JWT)
  App->>Middleware: authenticateToken
  Middleware->>Middleware: verifica token
  Middleware-->>App: next() con req.user
  App->>Controller: getUserPurchases(req)
  Controller->>DB: Purchase.findAll({ user_id, date range, include: Track })
  DB-->>Controller: acquisti trovati
  Controller->>App: res.status(200)
  Controller->>App: res.json({ message, data })
  App-->>Client: lista acquisti filtrati
```

**Risposta in caso di successo**

```json
{
  "message": "Trovati 2 acquisti",
  "data": [
    {
      "id": 1,
      "track_id": ef90cefb-ea88-4c87-b61c-cab9c92653cd,
      "purchased_at": "2025-06-23T19:08:00.000Z",
      "Track": {
        "titolo": "Antes",
        "artista": "C.R.O",
        "album": "Rock"
      }
    },
    {
      "id": 2,
      "track_id": 1a58d8b2-2c5b-451e-a6fd-50a4d0e4af4c,
      "purchased_at": "2025-06-23T19:11:00.000Z",
      "Track": {
        "titolo": "Self Care",
        "artista": "Mac Miller",
        "album": "Swimming"
      }
    }
  ]
}
```


**Risposta in caso di errore**

Se il token è mancante o non valido, viene restituito un errore con codice **401**:

```json
{
  "error": "Unauthorized: Token mancante"
}
```

oppure:

```json
{
  "error": "Unauthorized: Token non valido o scaduto"
}
```


Per altri errori lato server viene restituito un errore con codice **500** e un messaggio generico:

```json
{
  "error": "Errore del server"
}
```

## GET: /purchase/:download_token

Restituisce i dettagli di un singolo acquisto tramite il token di download. Questa rotta non esegue controlli sulla validità temporale o sull’utilizzo del token: serve esclusivamente a mostrare le informazioni del brano associato e verificare se è ancora scaricabile.

**Richiesta**

Non richiede autenticazione né body. L’accesso avviene tramite il parametro :download_token nella route:
```http
GET /purchase/11dd93e0-8cb9-44b9-865e-254ed8b05f9f
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware loadPurchaseByToken:
  - Interroga il database Purchase tramite il download_token.
  - Verifica l’esistenza dell’acquisto e del relativo brano (Track).
  - In caso positivo, salva l’istanza nella proprietà req.purchaseInstance, altrimenti restituisce errore 404.
- Il controller getPurchaseDetails:
  - Estrae i dati dalla proprietà req.purchaseInstance.
  - Calcola se il brano è ancora scaricabile (non scaduto e non già usato).
  - Restituisce le informazioni del brano (titolo, artista, album, copertina) e il flag canDownload.

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

  Client->>App: GET /purchase/:download_token
  App->>Middleware: loadPurchaseByToken
  Middleware->>DB: Purchase.findOne({ download_token, include: Track })
  DB-->>Middleware: purchase trovato
  Middleware-->>App: next() con req.purchaseInstance
  App->>Controller: getPurchaseDetails
  Controller->>App: res.json({ brano, canDownload })
  App-->>Client: risposta JSON
```

**Risposta in caso di successo**

```json
{
  "titolo": "Antes",
  "artista": "C.R.O",
  "album": "Rock",
  "cover_path": "covers/antes.jpg",
  "canDownload": true
}
```

**Risposta in caso di errore**

Se il token non è valido o non è associato a un brano esistente, viene restituito un errore **404**:
```json
{
  "error": "Not Found: Token non valido"
}
```

Per altri errori lato server viene restituito un errore con codice **500** e un messaggio generico:
```json
{
  "error": "Errore del server"
}
```
