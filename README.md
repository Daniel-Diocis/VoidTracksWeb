# VoidTracksWeb

VoidTracksWeb è un'applicazione web per l'acquisto, la gestione e la riproduzione di brani musicali. 
Gli utenti possono registrarsi, scaricare brani (spendendo token) tramite link temporanei, creare playlist personalizzate con i propri brani scaricati e fare richieste (spendendo token) agli amministratori di caricare nuovi brani. 
Gli amministratori possono gestire gli utenti, ricaricare token e soddisfare/rifiutare le richieste degli utenti.

## Diagramma dei casi d'uso

![Diagramma dei casi d'uso](diagramma-casi-d-uso.jpg)

## Rotte

La seguente tabella mostra le rotte:

| Metodo | Rotta                          | Parametri                          |
|--------|--------------------------------|------------------------------------|
| POST   | /auth/register                 | username, password                 |
| POST   | /auth/login                    | username, password                 |
| GET    | /auth/private                  | token (header Authorization)       |
| PATCH  | /notifications/mark-as-seen    | token (header Authorization)       |
| GET    | /tracks                        | Nessuno                            |
| GET    | /tracks/popular                | Nessuno                            |
| GET    | /artists                       | Nessuno                            |
| GET    | /artists/byName/:nome          | Nessuno                            |
| POST   | /purchase                      | token (header Authorization), track_id |
| GET    | /purchase/download/:download_token | download_token (route param)   |
| GET    | /purchase                      | token (header Authorization), fromDate?, toDate? (query) |
| GET    | /purchase/:download_token      | download_token (route param)       |
| GET    | /playlists                     | token (header Authorization)       |
| POST   | /playlists                     | token (header Authorization), nome |
| GET    | /playlists/:id                 | token (header Authorization), id (route param) |
| DELETE | /playlists/:id                 | token (header Authorization), id (route param) |
| PATCH  | /playlists/:id                 | token (header Authorization), id (route param), nome |
| POST   | /playlists/:id/tracks          |  token (header Authorization), id (route param), track_id |
| DELETE | /playlists/:id/tracks/:trackId | token (header Authorization), id (route param), trackId (route param) |
| PATCH  | /playlists/:id/favorite        | token (header Authorization), id (route param), trackId |
| GET    | /requests/                     | token (header Authorization)       |
| POST:  | /requests/                     | token (header Authorization), brano, artista   |
| POST   | /requests/:id/vote             | token (header Authorization), id (route param)       |
| DELETE | /requests/:id/vote             | token (header Authorization), id (route param)       |
| PATCH  | /admin/recharge                | token (header Authorization), username, tokens |
| PATCH  | /admin/requests/:id/approve    | token (header Authorization), id (route param), tokensToAdd |

## Pattern utilizzati

### M(V)C (Model-(View)-Controller) Pattern

Il progetto segue un’architettura basata sul pattern Model-(View)-Controller (M(V)C), che prevede la separazione tra gestione dei dati (Model), logica applicativa (Controller) e interfaccia utente (View). In particolare, il backend sviluppato con Express si occupa delle componenti Model e Controller: i modelli, definiti tramite Sequelize, rappresentano le entità principali come utenti, brani, playlist e acquisti, mentre i controller gestiscono la logica applicativa e l’esposizione delle API RESTful. La View non è integrata direttamente nel backend, ma è sviluppata separatamente nel frontend React, che comunica con il backend attraverso chiamate HTTP. Questo approccio disaccoppiato consente una migliore organizzazione del progetto, favorendo la scalabilità, la manutenzione del codice e l’indipendenza nello sviluppo delle varie componenti.

### Singleton Pattern

Il Singleton Pattern è un pattern creazionale che garantisce l’esistenza di una sola istanza di una determinata classe, fornendo un punto di accesso globale a tale istanza. È particolarmente utile quando si desidera evitare la creazione di oggetti multipli e non necessari, ad esempio per la connessione al database.

Nel nostro progetto, il pattern è stato applicato nella gestione della connessione a PostgreSQL tramite Sequelize. La funzione getSequelizeInstance() restituisce sempre la stessa istanza del client Sequelize, evitando connessioni ridondanti.

Questo approccio garantisce:
- una connessione condivisa e consistente all’interno di tutta l’applicazione;
- l’inizializzazione lazy, ovvero l’istanza viene creata solo al primo utilizzo;
- una maggiore efficienza e controllo delle risorse.

```ts
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

let sequelizeInstance: Sequelize | null = null;

/**
 * Restituisce l'istanza condivisa di Sequelize configurata per PostgreSQL.
 *
 * - Utilizza la stringa di connessione `DATABASE_URL` dal file `.env`.
 * - Disabilita i log SQL per mantenere l’output della console pulito (`logging: false`).
 * - Implementa il pattern Singleton per garantire un'unica istanza in tutta l’applicazione.
 *
 * @returns Istanza condivisa di Sequelize.
 * @throws Errore se la variabile `DATABASE_URL` non è definita.
 */
export function getSequelizeInstance(): Sequelize {
  if (!sequelizeInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not defined in environment variables");
    }

    sequelizeInstance = new Sequelize(connectionString, {
      dialect: "postgres",
      logging: false,
    });
  }

  return sequelizeInstance;
}
```

Questa implementazione garantisce un’unica connessione gestita in modo centralizzato, migliorando la manutenibilità e l’efficienza dell’intera architettura backend.

### Factory Pattern

Il Factory Pattern è un pattern creazionale utilizzato per astrarre la logica di creazione di oggetti e centralizzarne l’istanziazione, migliorando la modularità, la leggibilità e la manutenibilità del codice. In particolare, questo pattern risulta utile quando si desidera produrre oggetti o risposte diverse a seconda di determinati parametri, evitando il codice duplicato.

Nel progetto VoidTracks, il Factory Pattern è stato impiegato per generare messaggi di risposta coerenti e centralizzati nei controller e nei middleware. La classe MessageFactory fornisce un metodo getStatusMessage che prende in input:
- l’oggetto Response di Express,
- un codice di stato HTTP (es. 400, 404, 401, etc.),
- un eventuale messaggio personalizzato.

Restituisce quindi una risposta JSON strutturata, con la frase standard del codice HTTP (es. "Bad Request") e, se presente, una descrizione personalizzata aggiuntiva.

```ts
import { Response } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

/**
 * Factory per la generazione centralizzata di messaggi di errore HTTP.
 *
 * Fornisce un metodo per restituire risposte JSON con codici di stato coerenti
 * e messaggi descrittivi, combinando le costanti `StatusCodes` e `ReasonPhrases`.
 */
export class MessageFactory {
  /**
   * Restituisce una risposta JSON con il codice di stato e un messaggio formattato.
   *
   * - Se fornito, `message` viene concatenato alla frase standard HTTP per maggiore chiarezza.
   * - In caso contrario, viene utilizzata solo la frase standard (es. "Bad Request").
   *
   * @param res - Oggetto `Response` di Express.
   * @param statusCode - Codice di stato HTTP da restituire.
   * @param message - Messaggio opzionale da includere nella risposta.
   * @returns L'oggetto `Response` con status e JSON del messaggio.
   */
  getStatusMessage(res: Response, statusCode: number, message?: string) {
    const statusKey = Object.keys(StatusCodes).find(
      key => StatusCodes[key as keyof typeof StatusCodes] === statusCode
    ) as keyof typeof ReasonPhrases;

    const reasonPhrase = ReasonPhrases[statusKey] || "Errore";
    const errorMessage = message ? `${reasonPhrase}: ${message}` : reasonPhrase;

    return res.status(statusCode).json({ error: errorMessage });
  }
}
```

In combinazione con il file errorMessages.ts, che funge da registro dei messaggi e codici HTTP, la MessageFactory consente di standardizzare tutte le risposte dell’API, mantenendo coerenza e semplicità anche nella gestione degli errori.

```ts
import { StatusCodes } from "http-status-codes";

export const ErrorMessages = {

    NOT_USER: { status: StatusCodes.UNAUTHORIZED, message: "Accesso negato. Login richiesto." },
    NOT_ADMIN: { status: StatusCodes.FORBIDDEN, message: "Privilegi insufficienti." },
    INVALID_RECHARGE_INPUT: { status: StatusCodes.BAD_REQUEST, message: "Username valido e numero di token ≥ 0 richiesto" },
    USER_NOT_FOUND: { status: StatusCodes.NOT_FOUND, message: "Utente non trovato" },
    
    INVALID_ARTIST_NAME: { status: StatusCodes.BAD_REQUEST, message: "Nome artista non valido" },
    ARTIST_NOT_FOUND: { status: StatusCodes.NOT_FOUND, message: "Artista non trovato" },

    MISSING_TOKEN: { status: StatusCodes.UNAUTHORIZED, message: "Token mancante" },
    INVALID_TOKEN: { status: StatusCodes.UNAUTHORIZED, message: "Token non valido o scaduto" },

    USERNAME_ALREADY_EXISTS: { status: StatusCodes.CONFLICT, message: "Username già in uso" },
    INVALID_CREDENTIALS: { status: StatusCodes.UNAUTHORIZED, message: "Credenziali non valide" },
    NOT_AUTHENTICATED_USER: { status: StatusCodes.UNAUTHORIZED, message: "Utente non autenticato" },
    
    PLAYLIST_NOT_FOUND: { status: StatusCodes.NOT_FOUND, message: "Playlist non trovata o accesso negato" },
    TRACK_ID_MISSING: { status: StatusCodes.BAD_REQUEST, message: "ID del brano mancante" },
    TRACK_NOT_PURCHASED: { status: StatusCodes.FORBIDDEN, message: "Brano non acquistato" },
    TRACK_ALREADY_IN_PLAYLIST: { status: StatusCodes.CONFLICT, message: "Brano già presente nella playlist" },

    TRACK_ID_VALIDATE: { status: StatusCodes.BAD_REQUEST, message: "Il campo 'track_id' è obbligatorio e deve essere una stringa" },
    TRACK_NOT_FOUND: { status: StatusCodes.NOT_FOUND, message: "Brano non trovato" },
    UNSUFFICIENT_TOKENS: { status: StatusCodes.UNAUTHORIZED, message: "Token insufficienti per l'acquisto" },
    INVALID_LINK: { status: StatusCodes.NOT_FOUND, message: "Link di download non valido" },
    ALREADY_USED_LINK: { status: StatusCodes.FORBIDDEN, message: "Link già utilizzato" },
    EXPIRED_LINK: { status: StatusCodes.FORBIDDEN, message: "Link scaduto" },
    INVALID_PURCHASE_TOKEN: { status: StatusCodes.NOT_FOUND, message: "Token non valido" },

    Q_NOT_STRING: { status: StatusCodes.BAD_REQUEST, message: "Il parametro 'q' deve essere una stringa" },
    
    INTERNAL_ERROR: { status: StatusCodes.INTERNAL_SERVER_ERROR, message: "Errore del server" },
} as const;
```

Questa implementazione consente di separare la logica applicativa dalla gestione dei messaggi di errore, facilitando la scalabilità del progetto e l’integrazione di nuove casistiche.

### Chain of Responsibility Pattern

Il Chain of Responsibility Pattern è un pattern comportamentale che consente di passare una richiesta attraverso una catena di gestori (handler). Ogni gestore decide se elaborare la richiesta o passarla al successivo nella catena. Questo approccio consente una struttura flessibile, estendibile e disaccoppiata.

Nel progetto VoidTracks, il pattern è stato applicato nella definizione delle rotte Express: ogni rotta include una catena di middleware, ognuno responsabile di un singolo controllo o trasformazione sulla richiesta.

**Esempio: auth.ts**

Nel file routes/auth.ts, la rotta /register è composta da tre middleware che formano la catena:
```ts
router.post("/register", validateAuthInput, checkUserExists, register);
```

1. validateAuthInput: verifica la validità di username e password (formato, presenza, ecc.).
2. checkUserExists: controlla se lo username è già presente nel database.
3. register: se tutto è corretto, viene eseguita la logica del controller.

Ogni middleware può:
- interrompere la catena e restituire un errore, se fallisce una condizione;
- continuare con next() se la verifica è superata.

**Altri esempi di catene**

```ts
router.post("/login", validateAuthInput, checkUserCredentials, login);
router.get("/private", authenticateToken, dailyTokenBonus, getPrivateUser);
```

Questa struttura consente di mantenere ogni controllo singolo, testabile e riutilizzabile, riducendo la complessità nei controller e migliorando la leggibilità complessiva del codice.


## Funzionamento del Progetto

Di seguito viene descritto il funzionamento delle principali rotte API del progetto **VoidTracks**, con esempi di richieste, risposte e meccanismi sottostanti.

### POST: /auth/register

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

### POST: /auth/login

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

### GET:/auth/private
Questa rotta permette di ottenere i dati completi dell’utente autenticato, inclusi i token residui, inviando il token JWT nell’header di autorizzazione.

**Richiesta**

Non richiede un body, ma è necessario fornire il token JWT nell’header Authorization:

```javascript
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware authenticateToken verifica il token JWT e recupera l’ID utente.
- Se il token è valido, recupera dal database i dati dell’utente associato.
- Il middleware daillyTokenBonus verifica e se l’utente non ha ancora ricevuto il bonus giornaliero, assegna un token aggiuntivo e aggiorna la data.
- Il middleware checkNotifications recupera le notifiche non lette.
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

  App->>Middleware: checkNotifications
  Middleware->>DB: cerca notifiche non lette associate a user.id
  DB-->>Middleware: restituisce le notifiche (se ci sono)
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

### PATCH: /notifications/mark-as-seen

Segna come lette tutte le notifiche non lette dell’utente autenticato (dopo avergliele fatte leggere ovviamente).

**Richiesta**

Richiede un token JWT valido nell’header Authorization:
```http
PATCH /notifications/mark-as-seen
Authorization: Bearer <token>
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware authenticateToken verifica il token JWT e recupera l’ID utente.
- Il controller markNotificationsAsSeen:
  - Recupera l’id utente da req.user.
  - Aggiorna tutte le notifiche con seen: false e user_id corrispondente, impostando seen: true.
  - Restituisce una risposta 204 No Content.

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

  Client->>App: PATCH /notifications/mark-as-seen

  App->>Middleware: authenticateToken
  Middleware->>JWTService: verify(token)
  JWTService-->>Middleware: payload
  Middleware-->>App: next()

  App->>Controller: markNotificationsAsSeen
  Controller->>DB: Notification.update({ seen: true }, { where: { user_id, seen: false } })
  DB-->>Controller: update completato
  Controller-->>App: res.sendStatus(204)

  App->>Client: res.status(204)
```

**Risposta in caso di successo**

Restituisce 204 No Content se l’operazione è completata correttamente (nessun corpo nella risposta):

```http
HTTP/1.1 204 No Content
```

**Risposta in caso di errore**

Se token mancante o non valido, viene restituito un errore con codice **401**:
```json
{
  "error": "Unauthorized: Token mancante"
}
```

oppure
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

### GET: /tracks

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
  Controller->>DB: Track.findAll
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

### GET: /tracks/popular

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
  Controller->>DB: Purchase.findAll
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

### GET: /artists

Restituisce la lista completa degli artisti presenti nel sistema. Non richiede autenticazione.

**Richiesta**

Non richiede body.
Accetta un parametro di query facoltativo:
```http
GET /artists
```

**Meccanismo**

Il meccanismo è il seguente:
- Il controller getAllArtists interroga il database per restituire tutti i record Artist.

**Diagramma di sequenza**

Il meccanismo che si innesca all'atto della chiamata è descritto dal seguente diagramma:

```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant App
  participant Controller
  participant DB

  Client->>App: GET /artists
  App->>Controller: getAllArtists(req)
  Controller->>DB: Artist.findAll()
  DB-->>Controller: lista artisti
  Controller-->>App: res.status(200).json(artists)

  App->>Client: res.status(200)
  App->>Client: res.json(artists)
```

**Risposta in caso di successo**

Viene restituito un array JSON contenente tutti gli artisti:

```json
[
  {
    "id": 5e5a2c20-fd4f-4c2b-ac23-63312715686b,
    "nome": "C.R.O",
    "createdAt": "2025-06-13T12:54:36.000Z",
    "updatedAt": "2025-06-13T12:54:36.000Z"
  },
  ...
]
```

**Risposta in caso di errore**

Per errori lato server viene restituito un errore con codice **500** e un messaggio generico:
```json
{
  "error": "Errore del server"
}
```

### GET: /artists/byName/:nome

Restituisce un artista e tutti i suoi brani, effettuando una ricerca per nome (case-insensitive). Non richiede autenticazione.

**Richiesta**

La richiesta è una semplice chiamata GET che accetta il nome dell’artista come parametro URL. Esempio:
```http
GET /artists/byName/Mac%20Miller
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware validateArtistName controlla che il parametro nome sia valido.
- Il controller getArtistByName esegue:
  - Ricerca dell’artista tramite iLike.
  - Inclusione dei suoi brani (Track), escludendo la tabella pivot.

**Diagramma di sequenza**
```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant App
  participant Middleware
  participant Controller
  participant DB

  Client->>App: GET /artists/byName/Mac Miller

  App->>Middleware: validateArtistName
  Middleware-->>App: next()

  App->>Controller: getArtistByName(req)
  Controller->>DB: Artist.findOne({ where: { nome: { iLike: nome } }, include: Track })
  DB-->>Controller: artista + brani
  Controller-->>App: res.status(200).json(artist)

  App->>Client: res.status(200)
  App->>Client: res.json(artist)
```

**Risposta in caso di successo**

Restituisce la playlist, con i suoi brani:
```json
{
  "id": 1,
  "nome": "Mac Miller",
  "Tracks": [
    {
      "id": "1a58d8b2-2c5b-451e-a6fd-50a4d0e4af4c",
      "titolo": "Self Care",
      "album": "Swimming",
      "music_path": "Mac Miller - Self Care.mp3",
      "cover_path": "Mac Miller - Swimming.jpg"
    }
  ]
}
```

**Risposta in caso di errore**

Se manca il parametro nome o non è valido, viene restituito un errore con codice **400**:

```json
{
  "error": "Bad Request: Nome artista non valido"
}
```

Se l'artista non è stato trovato, viene restituito un errore con codice **404**:
```json
{
  "error": "Not Found: Artista non trovato"
}
```

Per altri errori lato server viene restituito un errore con codice **500** e un messaggio generico:
```json
{
  "error": "Errore del server"
}
```

### POST /purchase

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
- Il middleware authenticateToken verifica il token JWT e recupera l’ID utente.
- Il middleware validatePurchaseBody valida l’input (track_id).
- Il middlewarecheckUserAndTrackExist controlla che l’utente e il brano esistano nel database.
- Il middlewarecheckDuplicatePurchase verifica se esiste già un acquisto valido (non scaduto e non ancora utilizzato).
- Il middlewarecheckUserTokens controlla che l’utente abbia abbastanza token.
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
  participant JWTService
  participant DB
  participant Controller

  Client->>App: POST /purchase (track_id)

  App->>Middleware: authenticateToken
  Middleware->>JWTService: verify(token)
  JWTService-->>Middleware: payload
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
  Controller->>DB: User.update (scala token)
  DB-->>Controller: OK

  Controller->>DB: Purchase.create()
  DB-->>Controller: acquisto creato

  Controller-->>App: res.status(201).json({ download_token })

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

### GET: /purchase/download/:download_token

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
  Middleware->>DB: Purchase.findOne
  DB-->>Middleware: acquisto trovato
  Middleware->>Middleware: verifica scadenza o uso
  Middleware-->>App: next()

  App->>Controller: downloadTrack(req)
  Controller->>Controller: purchase.used_flag = true
  Controller->>DB: purchase.save()
  DB-->>Controller: OK

  Controller->>Supabase: ottieni fileUrl
  Supabase-->>Controller: audio stream

  Controller->>App: res.setHeader + stream
  App-->>Client: download file audio
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
  "error": "Forbidden: Link già utilizzato"
}
```

Token scaduto:
```json
{
  "error": "Forbidden: Link scaduto"
}
```

Per altri errori lato server viene restituito un errore con codice **500** e un messaggio generico:

```json
{
  "error": "Errore del server"
}
```

### GET: /purchase

Recupera la lista di tutti gli acquisti effettuati dall’utente autenticato. È possibile applicare filtri opzionali per data (fromDate e toDate) tramite query string. La rotta è protetta da autenticazione JWT.

**Richiesta**

La richiesta deve contenere un token JWT valido nell’header Authorization:
```http
GET /purchase?fromDate=2024-06-01&toDate=2024-06-30
Authorization: Bearer <JWT>
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware authenticateToken verifica il token JWT e recupera l’ID utente.
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
  participant JWTService
  participant Controller
  participant DB

  Client->>App: GET /purchase (Authorization: Bearer JWT)

  App->>Middleware: authenticateToken
  Middleware->>JWTService: verify(token)
  JWTService-->>Middleware: payload
  Middleware-->>App: next()

  App->>Controller: getUserPurchases(req)
  Controller->>DB: Purchase.findAll
  DB-->>Controller: elenco acquisti
  Controller-->>App: res.status(200).json(acquisti)

  App->>Client: res.status(200)
  App->>Client: res.json(acquisti)
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

### GET: /purchase/:download_token

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
  Middleware->>DB: Purchase.findOne
  DB-->>Middleware: purchase trovato
  Middleware-->>App: next()

  App->>Controller: getPurchaseDetails(req)
  Controller-->>App: res.status(200).json({ brano, canDownload })

  App->>Client: res.status(200)
  App->>Client: res.json({ brano, canDownload })
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

### GET: /playlists

Restituisce tutte le playlist create dall’utente autenticato, ordinate dalla più recente alla meno recente.

**Richiesta**

Richiede un token JWT valido nell’Authorization header:
```http
GET /playlists
Authorization: Bearer <token>
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware authenticateToken verifica il token JWT e recupera l’ID utente.
- Il controller listUserPlaylists:
  - Estrae l’ID dell’utente autenticato da req.user.
  - Recupera tutte le playlist associate a quell’utente.
  - Le ordina per data di creazione (dalla più recente).
  - Le restituisce come array JSON.

**Diagramma di sequenza**

```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant App
  participant Middleware
  participant JWTService
  participant Controller
  participant DB

  Client->>App: GET /playlists

  App->>Middleware: authenticateToken
  Middleware->>JWTService: verify(token)
  JWTService-->>Middleware: payload
  Middleware-->>App: next()

  App->>Controller: listUserPlaylists(req)
  Controller->>DB: Playlist.findAll
  DB-->>Controller: array playlist
  Controller-->>App: res.status(200).json(playlists)

  App->>Client: res.status(200)
  App->>Client: res.json(playlists)
```

**Risposta in caso di successo**

Se esistono playlist create dall’utente, viene restituito un array JSON contenente le playlist:
```json
[
  {
    "id": 3,
    "nome": "Workout Playlist",
    "user_id": 17,
    "createdAt": "2025-06-24T14:23:45.123Z",
    "updatedAt": "2025-06-24T14:23:45.123Z"
  },
  {
    "id": 2,
    "nome": "Chill Mix",
    "user_id": 17,
    "createdAt": "2025-06-24T17:39:00.000Z",
    "updatedAt": "2025-06-20T17:40:00.000Z"
  }
]
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

### POST: /playlists

Crea una nuova playlist associata all’utente autenticato.

**Richiesta**

Richiede un token JWT valido nel header Authorization e un corpo JSON contenente il nome della nuova playlist:
```http
POST /playlists
Authorization: Bearer <token>
Content-Type: application/json

{
  "nome": "Nuova Playlist"
}
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware authenticateToken verifica il token JWT e recupera l’ID utente.
- Il controller createPlaylist:
  - Estrae l’ID dell’utente da req.user.
  - Legge il campo nome dal corpo della richiesta.
  - Crea una nuova entry nella tabella playlists con user_id e nome.
  - Restituisce la nuova playlist creata come oggetto JSON.

**Diagramma di sequenza**
```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant App
  participant Middleware
  participant JWTService
  participant Controller
  participant DB

  Client->>App: POST /playlists (nome)

  App->>Middleware: authenticateToken
  Middleware->>JWTService: verify(token)
  JWTService-->>Middleware: payload
  Middleware-->>App: next()

  App->>Controller: createPlaylist(req)
  Controller->>DB: Playlist.create
  DB-->>Controller: nuova playlist
  Controller-->>App: res.status(201).json(nuovaPlaylist)

  App->>Client: res.status(201)
  App->>Client: res.json(nuovaPlaylist)
```

**Risposta in caso di successo**

Se la playlist viene creata correttamente, il server restituisce un oggetto JSON con i dati della nuova playlist:
```json
{
  "id": 12,
  "nome": "Nuova Playlist",
  "user_id": 17,
  "createdAt": "2025-06-24T17:47:00.000Z",
  "updatedAt": "2025-06-24T17:47:00.000Z"
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

### GET: /playlists/:id

Restituisce i dettagli di una specifica playlist, inclusi tutti i brani associati.

**Richiesta**

Richiede un token JWT valido nell’Authorization header:
```http
GET /playlists/:id
Authorization: Bearer <token>
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware authenticateToken verifica il token JWT e recupera l’ID utente.
- Il middleware checkPlaylistOwnership: Verifica che la playlist appartenga all’utente.
- Il controller getPlaylistWithTracks:
  - Ottiene i dettagli della playlist (id, nome, createdAt, updatedAt).
  - Recupera tutti i brani associati a quella playlist, inclusi titolo, artista, album, cover_path, is_favorite.
  - Restituisce un oggetto JSON con le informazioni della playlist e un array di brani.

**Diagramma di sequenza**
```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant App
  participant Middleware
  participant JWTService
  participant Controller
  participant DB

  Client->>App: GET /playlists/:id

  App->>Middleware: authenticateToken
  Middleware->>JWTService: verify(token)
  JWTService-->>Middleware: payload
  Middleware-->>App: next()

  App->>Middleware: checkPlaylistOwnership
  Middleware->>DB: Playlist.findOne
  DB-->>Middleware: playlist
  Middleware-->>App: next()

  App->>Controller: getPlaylistWithTracks(req)
  Controller->>DB: PlaylistTrack.findAll
  DB-->>Controller: tracks + metadati
  Controller-->>App: res.status(200).json({ playlist, tracks })

  App->>Client: res.status(200)
  App->>Client: res.json({ playlist, tracks })
```

**Risposta in caso di successo**

Restituisce la playlist, con i suoi brani:
```json
{
  "playlist": {
    "id": 2,
    "nome": "Chill Mix",
    "createdAt": "2025-06-24T17:39:00.000Z",
    "updatedAt": "2025-06-20T17:39:00.000Z"
  },
  "tracks": [
    {
      "id": ef90cefb-ea88-4c87-b61c-cab9c92653cd,
      "titolo": "Antes",
      "artista": "C.R.O",
      "album": "Rock",
      "cover_path": "Rock.jpg",
      "is_favorite": true
    },
    {
      "id": 1a58d8b2-2c5b-451e-a6fd-50a4d0e4af4c,
      "titolo": "Self Care",
      "artista": "Mac Miller",
      "album": "Swimming",
      "cover_path": "Swimming.jpg",
      "is_favorite": true
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

Se la playlist non è stata trovata, viene restituito un errore con codice **403**:
```json
{
  "error": "Not Found: Playlist non trovata"
}
```

Per altri errori lato server viene restituito un errore con codice **500** e un messaggio generico:

```json
{
  "error": "Errore del server"
}
```

### DELETE: /playlists/:id

Elimina una playlist esistente appartenente all’utente autenticato.

**Richiesta**

Richiede un token JWT valido nell’Authorization header:
```http
DELETE /playlists/:id
Authorization: Bearer <token>
```

Body della richiesta:
```json
{
  "nome": "Nuovo nome playlist"
}
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware authenticateToken verifica il token JWT e recupera l’ID utente.
- Il middleware checkPlaylistOwnership: Verifica che la playlist appartenga all’utente.
- Il controller renamePlaylist:
  - Legge il nuovo nome dal body.
  - Aggiorna il campo nome della playlist.
  - Restituisce un messaggio di conferma e i dati aggiornati.

**Diagramma di sequenza**
```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant App
  participant Middleware
  participant JWTService
  participant Controller
  participant DB

  Client->>App: DELETE /playlists/:id

  App->>Middleware: authenticateToken
  Middleware->>JWTService: verify(token)
  JWTService-->>Middleware: payload
  Middleware-->>App: next()

  App->>Middleware: checkPlaylistOwnership
  Middleware->>DB: Playlist.findOne
  DB-->>Middleware: playlist
  Middleware-->>App: next()

  App->>Controller: deletePlaylist(req)
  Controller->>DB: Playlist.destroy
  DB-->>Controller: OK
  Controller-->>App: res.status(200).json({ message })

  App->>Client: res.status(200)
  App->>Client: res.json({ message: "Playlist eliminata con successo" })
```

**Risposta in caso di successo**

Restituisce il messaggio di modifica:
```json
{
  "message": "Nome della playlist aggiornato con successo",
  "playlist": {
    "id": 5,
    "nome": "Nuovo nome playlist",
    "createdAt": "2025-06-22T15:00:00.000Z",
    "updatedAt": "2025-06-24T10:12:00.000Z"
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

Se la playlist non è stata trovata, viene restituito un errore con codice **403**:
```json
{
  "error": "Not Found: Playlist non trovata"
}
```

Per altri errori lato server viene restituito un errore con codice **500** e un messaggio generico:

```json
{
  "error": "Errore del server"
}
```

### PATCH: /playlists/:id

Rinomina una playlist esistente appartenente all’utente autenticato.

**Richiesta**

Richiede un token JWT valido nell’Authorization header:
```http
PATCH /playlists/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware authenticateToken verifica il token JWT e recupera l’ID utente.
- Il middleware checkPlaylistOwnership: Verifica che la playlist appartenga all’utente.
- Il controller deletePlaylist:
  - Elimina la playlist identificata da :id.
  - Restituisce un messaggio di conferma.

**Diagramma di sequenza**
```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant App
  participant Middleware
  participant JWTService
  participant Controller
  participant DB

  Client->>App: PATCH /playlists/:id (body: { nome })

  App->>Middleware: authenticateToken
  Middleware->>JWTService: verify(token)
  JWTService-->>Middleware: payload
  Middleware-->>App: next()

  App->>Middleware: checkPlaylistOwnership
  Middleware->>DB: Playlist.findOne
  DB-->>Middleware: playlist trovata
  Middleware-->>App: next()

  App->>Controller: renamePlaylist(req)
  Controller->>DB: Playlist.update
  DB-->>Controller: OK
  Controller-->>App: res.status(200).json({ message, playlist })

  App->>Client: res.status(200)
  App->>Client: res.json({ message, playlist })
```

**Risposta in caso di successo**

Restituisce il messaggio di eliminazione:
```json
{
  "message": "Playlist eliminata con successo"
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

Se la playlist non è stata trovata, viene restituito un errore con codice **403**:
```json
{
  "error": "Not Found: Playlist non trovata"
}
```

Per altri errori lato server viene restituito un errore con codice **500** e un messaggio generico:

```json
{
  "error": "Errore del server"
}
```

### POST: /playlists/:id/tracks

Aggiunge un brano acquistato a una playlist dell’utente autenticato.

**Richiesta**

Richiede un token JWT valido nel header Authorization e il campo track_id nel corpo JSON:
```http
POST /playlists/7/tracks
Authorization: Bearer <token>
Content-Type: application/json

{
  "track_id": 17
}
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware authenticateToken verifica il token JWT e recupera l’ID utente.
- Il middleware checkPlaylistOwnership: verifica che la playlist appartenga all’utente.
- Il middleware checkTrackIdInBody: controlla che track_id sia presente nel corpo.
- Il middleware checkTrackOwnership: verifica che l’utente abbia acquistato il brano.
- Il middlware checkTrackNotInPlaylist: assicura che il brano non sia già presente nella playlist.
- Il controller addTrackToPlaylist: aggiunge il brano alla playlist.

**Diagramma di sequenza**
```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant App
  participant Middleware
  participant JWTService
  participant DB
  participant Controller

  Client->>App: POST /playlists/:id/tracks

  App->>Middleware: authenticateToken
  Middleware->>JWTService: verify(token)
  JWTService-->>Middleware: payload
  Middleware-->>App: next()

  App->>Middleware: checkPlaylistOwnership
  Middleware->>DB: Playlist.findOne
  DB-->>Middleware: Playlist trovata
  Middleware-->>App: next()

  App->>Middleware: checkTrackIdInBody
  Middleware-->>App: next()

  App->>Middleware: checkTrackOwnership
  Middleware->>DB: Purchase.findOne
  DB-->>Middleware: Acquisto trovato
  Middleware-->>App: next()

  App->>Middleware: checkTrackNotInPlaylist
  Middleware->>DB: PlaylistTrack.findOne
  DB-->>Middleware: Nessun duplicato
  Middleware-->>App: next()

  App->>Controller: addTrackToPlaylist
  Controller->>DB: PlaylistTrack.create
  DB-->>Controller: brano aggiunto
  Controller-->>App: res.status(201).json({ message, track })

  App->>Client: res.status(201)
  App->>Client: res.json({ message: "Brano aggiunto alla playlist", track })
```

**Risposta in caso di successo**

Se la playlist viene creata correttamente, il server restituisce un oggetto JSON con i dati della nuova playlist:
```json
{
  "message": "Brano aggiunto alla playlist",
  "track": {
    "id": 4,
    "playlist_id": 2,
    "track_id": ef90cefb-ea88-4c87-b61c-cab9c92653cd,
    "is_favorite": false,
    "createdAt": "2025-06-24T19:00:00.000Z",
    "updatedAt": "2025-06-24T19:00:00.000Z"
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

Per altri errori lato server viene restituito un errore con codice **500** e un messaggio generico:

```json
{
  "error": "Errore del server"
}
```

### DELETE: /playlists/:id/tracks/:trackId

Rimuove un brano da una playlist dell’utente autenticato.

**Richiesta**

Richiede un token JWT valido nell’Authorization header:
```http
DELETE /playlists/2/tracks/17
Authorization: Bearer <token>
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware authenticateToken verifica il token JWT e recupera l’ID utente.
- Il middleware checkPlaylistOwnership verifica che la playlist appartenga all’utente.
- Il middleware checkTrackIdParam controlla la presenza del parametro trackId nell’URL.
- Il controller removeTrackFromPlaylist: rimuove il brano dalla playlist.

**Diagramma di sequenza**
```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant App
  participant Middleware
  participant JWTService
  participant DB
  participant Controller

  Client->>App: DELETE /playlists/:id/tracks/:trackId

  App->>Middleware: authenticateToken
  Middleware->>JWTService: verify(token)
  JWTService-->>Middleware: payload
  Middleware-->>App: next()

  App->>Middleware: checkPlaylistOwnership
  Middleware->>DB: Playlist.findOne
  DB-->>Middleware: Playlist trovata
  Middleware-->>App: next()

  App->>Middleware: checkTrackIdParam
  Middleware-->>App: next()

  App->>Controller: removeTrackFromPlaylist
  Controller->>DB: PlaylistTrack.destroy
  DB-->>Controller: rimozione eseguita
  Controller-->>App: res.status(200).json({ message })

  App->>Client: res.status(200)
  App->>Client: res.json({ message: "Brano rimosso dalla playlist" })
```

**Risposta in caso di successo**

Restituisce il messaggio di eliminazione:
```json
{
  "message": "Brano rimosso dalla playlist"
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

Se la playlist non è stata trovata, viene restituito un errore con codice **403**:
```json
{
  "error": "Not Found: Playlist non trovata"
}
```

Per altri errori lato server viene restituito un errore con codice **500** e un messaggio generico:

```json
{
  "error": "Errore del server"
}
```

### PATCH: /playlists/:id/favorite

Imposta un brano come preferito in una playlist dell’utente autenticato.
L’operazione azzera il campo is_favorite per tutti gli altri brani della stessa playlist.

**Richiesta**

Richiede un token JWT valido nel header Authorization e il trackId nel body della richiesta:
```http
PATCH /playlists/7/favorite
Authorization: Bearer <token>
Content-Type: application/json

{
  "trackId": 42
}
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware authenticateToken verifica il token JWT e recupera l’ID utente.
- Il middleware checkPlaylistOwnership: Verifica che la playlist appartenga all’utente.
- Il middleware checkTrackIdInFavoriteBody: controlla la presenza del campo trackId nel body.
- Il controller checkTrackIdInFavoriteBody: controlla la presenza del campo trackId nel body.

**Diagramma di sequenza**

```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant App
  participant Middleware
  participant JWTService
  participant DB
  participant Controller

  Client->>App: PATCH /playlists/:id/favorite

  App->>Middleware: authenticateToken
  Middleware->>JWTService: verify(token)
  JWTService-->>Middleware: payload
  Middleware-->>App: next()

  App->>Middleware: checkPlaylistOwnership
  Middleware->>DB: Playlist.findOne
  DB-->>Middleware: Playlist trovata
  Middleware-->>App: next()

  App->>Middleware: checkTrackIdInFavoriteBody
  Middleware-->>App: next()

  App->>Controller: setFavoriteTrack
  Controller->>DB: PlaylistTrack.update (tutti is_favorite=false)
  DB-->>Controller: ok
  Controller->>DB: PlaylistTrack.update (uno is_favorite=true)
  DB-->>Controller: ok
  Controller-->>App: res.status(200).json({ message })

  App->>Client: res.status(200)
  App->>Client: res.json({ message: "Brano preferito aggiornato con successo" })
```

**Risposta in caso di successo**

Restituisce il messaggio di aggiornamento brano preferito:
```json
{
  "message": "Brano preferito aggiornato con successo"
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

Se la playlist non è stata trovata, viene restituito un errore con codice **403**:
```json
{
  "error": "Not Found: Playlist non trovata"
}
```

Per altri errori lato server viene restituito un errore con codice **500** e un messaggio generico:

```json
{
  "error": "Errore del server"
}
```

### GET: /requests

Restituisce tutte le richieste con stato "waiting" ordinate per numero di voti, indicando anche se l’utente loggato ha già votato ciascuna richiesta.

**Richiesta**

Richiede un token JWT valido nell’Authorization header:
```http
GET /requests
Authorization: Bearer <token>
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware authenticateToken verifica il token JWT e recupera l’ID utente.
- Il controller getAllRequests:
  - Recupera tutte le richieste con status = "waiting" dal database.
  - Include i voti associati tramite RequestVote.
  - Recupera le richieste già votate dall’utente.
  - Costruisce la risposta con: numero di voti e flag hasVoted.

**Diagramma di sequenza**
```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant App
  participant Middleware
  participant JWTService
  participant DB
  participant Controller

  Client->>App: GET /requests

  App->>Middleware: authenticateToken
  Middleware->>JWTService: verify(token)
  JWTService-->>Middleware: payload
  Middleware-->>App: next()

  App->>Controller: getAllRequests(req)

  Controller->>DB: Request.findAll({ status: "waiting", include: votes })
  DB-->>Controller: richieste con voti

  Controller->>DB: RequestVote.findAll({ user_id: req.user.id })
  DB-->>Controller: lista voti utente

  Controller-->>App: res.status(200).json(richieste annotate)

  App->>Client: res.status(200)
  App->>Client: res.json([...])
```

**Risposta in caso di successo**

Restituisce le richieste in stato di waiting:
```json
[
  {
    "id": 5,
    "brano": "Numb",
    "artista": "Linkin Park",
    "status": "waiting",
    "tokens": 0,
    "createdAt": "2025-06-25T15:20:00.000Z",
    "updatedAt": "2025-06-23T15:20:00.000Z",
    "voti": 3,
    "hasVoted": true
  },
  {
    "id": 6,
    "brano": "Agosto",
    "artista": "Bad Bunny",
    "status": "waiting",
    "tokens": 0,
    "createdAt": "2025-06-25T15:22:00.000Z",
    "updatedAt": "2025-06-25T15:22:00.000Z",
    "voti": 1,
    "hasVoted": false
  }
]
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

### POST: /requests

Permette a un utente autenticato di inviare una nuova richiesta di brano.

**Richiesta**

Richiede un token JWT valido nel header Authorization e un corpo JSON contenente i campi brano e artista:
```http
POST /requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "brano": "DNA",
  "artista": "Kendrick Lamar"
}
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware authenticateToken verifica il token JWT e recupera l’ID utente.
- Il middleware validateRequestInput controlla la presenza dei campi brano e artista.
- Il controller createRequest:
  - Controlla che non esistano richieste duplicate in stato waiting o satisfied.
  - Se tutto è valido, crea una nuova richiesta con status "waiting" e tokens = 0.

**Diagramma di sequenza**
```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant App
  participant Middleware
  participant JWTService
  participant DB
  participant Controller

  Client->>App: POST /requests

  App->>Middleware: authenticateToken
  Middleware->>JWTService: verify(token)
  JWTService-->>Middleware: payload
  Middleware-->>App: next()

  App->>Middleware: validateRequestInput
  Middleware-->>App: next()

  App->>Controller: createRequest
  Controller->>DB: Request.findOne (duplicati)
  DB-->>Controller: Nessun duplicato
  Controller->>DB: Request.create
  DB-->>Controller: richiesta salvata
  Controller-->>App: res.status(201).json({ message, request })

  App->>Client: res.status(201)
  App->>Client: res.json({ message: "Richiesta creata con successo", request })
```

**Risposta in caso di successo**

Se la richiesta viene creata correttamente:
```json
{
  "message": "Richiesta creata con successo",
  "request": {
    "id": 7,
    "brano": "DNA",
    "artista": "Kendrick Lamar",
    "status": "waiting",
    "tokens": 0,
    "createdAt": "2025-06-25T21:21:00.000Z",
    "updatedAt": "2025-06-25T21:21:00.000Z"
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

Se la richiesta è già presente, viene restituito un errore con codice **409**:
```json
{
  "error": "Conflict: Esiste già una richiesta identica"
}
```

Se i campi brano o artista sono assenti o con altro formato, viene restituito un errore con codice **400**:
```json
{
  "error": "Bad Request: Dati non validi"
}
```

Per altri errori lato server viene restituito un errore con codice **500** e un messaggio generico:
```json
{
  "error": "Errore del server"
}
```

### POST: /requests/:id/vote

Permette a un utente autenticato di votare una richiesta esistente, incrementando il numero totale di voti. È possibile esprimere un solo voto per richiesta.

**Richiesta**

Richiede un token JWT valido nell’header Authorization.
```http
POST /requests/42/vote
Authorization: Bearer <token>
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware authenticateToken verifica il token JWT e recupera l’ID utente.
- Il middleware checkAlreadyVoted controlla che l’utente non abbia già votato quella richiesta.
- Il controller voteRequest: registra il voto nella tabella RequestVote.

**Diagramma di sequenza**

```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant App
  participant Middleware
  participant JWTService
  participant DB
  participant Controller

  Client->>App: POST /requests/:id/vote

  App->>Middleware: authenticateToken
  Middleware->>JWTService: verify(token)
  JWTService-->>Middleware: payload
  Middleware-->>App: next()

  App->>Middleware: checkAlreadyVoted
  Middleware->>DB: RequestVote.findOne
  DB-->>Middleware: Nessun voto trovato
  Middleware-->>App: next()

  App->>Controller: voteRequest
  Controller->>DB: RequestVote.create
  DB-->>Controller: Voto registrato
  Controller-->>App: res.status(201).json({ message })

  App->>Client: res.status(201)
  App->>Client: { "message": "Voto aggiunto" }
```

**Risposta in caso di successo**

Viene restituito il seguente messagio:
```json
{
  "message": "Voto aggiunto"
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

Se l'utente ha già votato, viene restituito un errore con codice **400**:
```json
{
  "error": "Bad Request: Hai già votato questa richiesta"
}
```

Per altri errori lato server viene restituito un errore con codice **500** e un messaggio generico:

```json
{
  "error": "Errore del server"
}
```

### DELETE: /requests/:id/vote

Permette a un utente autenticato di rimuovere il proprio voto da una richiesta, se precedentemente espresso.

**Richiesta**

Richiede un token JWT valido nell’header Authorization.
```http
DELETE /requests/42/vote
Authorization: Bearer <token>
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware authenticateToken verifica il token JWT e recupera l’ID utente.
- Il middleware checkHasVoted: controlla che l’utente abbia già votato quella richiesta.
- Il controller unvoteRequest: elimina il voto dalla tabella RequestVote.

**Diagramma di sequenza**

```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant App
  participant Middleware
  participant JWTService
  participant DB
  participant Controller

  Client->>App: DELETE /requests/:id/vote

  App->>Middleware: authenticateToken
  Middleware->>JWTService: verify(token)
  JWTService-->>Middleware: payload
  Middleware-->>App: next()

  App->>Middleware: checkHasVoted
  Middleware->>DB: RequestVote.findOne
  DB-->>Middleware: Voto trovato
  Middleware-->>App: next()

  App->>Controller: unvoteRequest
  Controller->>DB: RequestVote.destroy
  DB-->>Controller: Voto eliminato
  Controller-->>App: res.status(200).json({ message })

  App->>Client: res.status(200)
  App->>Client: { "message": "Voto rimosso" }
```

**Risposta in caso di successo**

Viene restituito il seguente messagio:
```json
{
  "message": "Voto rimosso"
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

Se non è stato trovato il voto da annullare, viene restituito un errore con codice **400**:
```json
{
  "error": "Bad Request: Non hai votato questa richiesta"
}
```

Per altri errori lato server viene restituito un errore con codice **500** e un messaggio generico:

```json
{
  "error": "Errore del server"
}
```

### GET: /requests

Permette a un amministratore autenticato di ricaricare i token a un utente esistente, specificando lo username e il numero di token da aggiungere.

**Richiesta**

La richiesta deve contenere un token JWT valido con ruolo admin nell’header Authorization:
```http
GET /admin/requests
Authorization: Bearer <JWT>
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware authenticateToken verifica il token JWT e recupera l’ID utente.
- Il middleware authenticateAdmin controlla che il ruolo dell’utente sia admin.
- Il controller getAllRequests:
  - Recupera tutte le richieste con stato "waiting".
  - Include i voti associati a ciascuna richiesta (via RequestVote).
  - Recupera le richieste votate dall’utente autenticato.
  - Costruisce la risposta JSON con i seguenti campi per ogni richiesta:
    - id, brano, artista, status, tokens, createdAt, updatedAt
    - voti (numero di voti)
    - hasVoted (booleano: true/false)

**Diagramma di sequenza**

Il meccanismo che si innesca all'atto della chiamata è descritto dal seguente diagramma:

```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant App
  participant Middleware
  participant JWTService
  participant Controller
  participant DB

  Client->>App: GET /requests

  App->>Middleware: authenticateToken
  Middleware->>JWTService: verify(token)
  JWTService-->>Middleware: payload
  Middleware-->>App: next()

  App->>Controller: getAllRequests(req)

  Controller->>DB: Request.findAll({ status: "waiting", include: RequestVote })
  DB-->>Controller: elenco richieste con voti

  Controller->>DB: RequestVote.findAll({ user_id: req.user.id })
  DB-->>Controller: lista richieste votate

  Controller-->>App: res.status(200).json(richieste con voti e hasVoted)

  App->>Client: res.status(200)
  App->>Client: JSON con richieste
```

**Risposta in caso di successo**

```json
[
  {
    "id": 7,
    "brano": "DNA",
    "artista": "Kendrick Lamar",
    "status": "waiting",
    "tokens": 0,
    "createdAt": "2025-06-25T21:21:00.000Z",
    "updatedAt": "2025-06-25T21:21:00.000Z",
    "voti": 3,
    "hasVoted": true
  },
  {
    "id": 6,
    "brano": "Agosto",
    "artista": "Bad Bunny",
    "status": "waiting",
    "tokens": 0,
    "createdAt": "2025-06-25T15:22:00.000Z",
    "updatedAt": "2025-06-25T15:22:00.000Z",
    "voti": 1,
    "hasVoted": false
  }
]
```

**Risposta in caso di errore**

Se token mancante o non valido, viene restituito un errore con codice **401**:
```json
{
  "error": "Unauthorized: Token mancante"
}
```

oppure
```json
{
  "error": "Unauthorized: Token non valido o scaduto"
}
```

Se l'utente non è admin, viene restituito un errore con codice **403**:
```json
{
  "error": "Forbidden: Privilegi insufficienti"
}
```

Per altri errori lato server viene restituito un errore con codice **500** e un messaggio generico:

```json
{
  "error": "Errore del server"
}
```

### PATCH: /admin/requests/:id/approve

Permette a un amministratore autenticato di approvare una richiesta di brano in stato waiting, impostandola come satisfied e assegnando un numero specificato di token all’utente che l’ha inviata.

**Richiesta**

Richiede un token JWT valido con ruolo admin nell’header Authorization, e un campo tokensToAdd nel corpo della richiesta:
```http
PATCH /admin/requests/42/approve
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "tokensToAdd": 5
}
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware authenticateToken verifica il token JWT e recupera l’ID utente.
- Il middleware authenticateAdmin controlla che il ruolo dell’utente sia admin.
- Il middleware checkRequestWaiting verifica che la richiesta sia in stato waiting.
- Il middleware validateTokenAmount valida il campo tokensToAdd (intero ≥ 0).
- Il controller approveRequest:
  - Imposta lo stato della richiesta su satisfied.
  - Aggiunge tokensToAdd al saldo token dell’utente che ha effettuato la richiesta.
  - Salva le modifiche e restituisce un messaggio di conferma.

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

  Client->>App: PATCH /admin/requests/:id/approve

  App->>Middleware: authenticateToken
  Middleware->>JWTService: verify(token)
  JWTService-->>Middleware: payload
  Middleware-->>App: next()

  App->>Middleware: authenticateAdmin
  Middleware-->>App: next()

  App->>Middleware: checkRequestWaiting
  Middleware->>DB: Request.findByPk(:id)
  DB-->>Middleware: stato = "waiting"
  Middleware-->>App: next()

  App->>Middleware: validateTokenAmount
  Middleware-->>App: next()

  App->>Controller: approveRequest
  Controller->>DB: Request.update(status = "satisfied")
  Controller->>DB: User.findByPk(request.user_id)
  Controller->>DB: user.tokens += tokensToAdd → user.save()
  DB-->>Controller: ok
  Controller-->>App: res.status(200).json({ message })

  App->>Client: res.status(200)
  App->>Client: { "message": "Richiesta approvata, 5 token assegnati" }
```

**Risposta in caso di successo**

```json
{
  "message": "Richiesta approvata, 5 token assegnati"
}
```


**Risposta in caso di errore**

Se token mancante o non valido, viene restituito un errore con codice **401**:
```json
{
  "error": "Unauthorized: Token mancante"
}
```

oppure
```json
{
  "error": "Unauthorized: Token non valido o scaduto"
}
```

Se l'utente non è admin, viene restituito un errore con codice **403**:
```json
{
  "error": "Forbidden: Privilegi insufficienti"
}
```

Se il campo tokensToAdd è assente o non valido, viene restituito un errore con codice **400**:
```json
{
  "error": "Bad Request: Numero di token non valido"
}
```

Se la richiesta non è in stato waiting, viene restituito un errore con codice **409**:
```json
{
  "error": "Conflict: La richiesta non è più approvabile"
}
```

Se la richiesta non è stata trovata, viene restituito un errore con codice **404**:
```json
{
  "error": "Not Found: Richiesta non trovata"
}
```

Per altri errori lato server viene restituito un errore con codice **500** e un messaggio generico:

```json
{
  "error": "Errore del server"
}
```

### PATCH: /admin/recharge

Permette a un amministratore autenticato di ricaricare i token a un utente esistente, specificando lo username e il numero di token da aggiungere.

**Richiesta**

La richiesta deve contenere un token JWT valido con ruolo admin nell’header Authorization:
```http
PATCH /admin/recharge
Authorization: Bearer <JWT>
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware authenticateToken verifica il token JWT e recupera l’ID utente.
- Il middleware authenticateAdmin controlla che il ruolo dell’utente sia admin.
- Il middleware validateRechargeInput convalida i campi username (stringa) e tokens (numero ≥ 0).
- Il controller rechargeTokens:
  - Cerca l’utente nel database tramite username.
  - Se lo trova, aggiorna il campo tokens e salva il record.
  - Restituisce un messaggio di conferma e il nuovo saldo token.

**Diagramma di sequenza**

Il meccanismo che si innesca all'atto della chiamata è descritto dal seguente diagramma:

```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant App
  participant Middleware
  participant JWTService
  participant Controller
  participant DB

  Client->>App: PATCH /admin/recharge (Authorization: Bearer JWT)

  App->>Middleware: authenticateToken
  Middleware->>JWTService: verify(token)
  JWTService-->>Middleware: payload
  Middleware-->>App: next()

  App->>Middleware: authenticateAdmin
  Middleware-->>App: next()

  App->>Middleware: validateRechargeInput
  Middleware-->>App: next()

  App->>Controller: rechargeTokens(req)
  Controller->>DB: User.findOne({ where: { username } })
  DB-->>Controller: utente trovato
  Controller->>DB: user.tokens = tokens → user.save()
  DB-->>Controller: ok
  Controller-->>App: res.status(200).json({ message, tokens })

  App->>Client: res.status(200)
  App->>Client: res.json({ message, tokens })
```

**Risposta in caso di successo**

```json
{
  "message": "Ricarica completata per utenteUno",
  "tokens": 10
}
```

**Risposta in caso di errore**

Se token mancante o non valido, viene restituito un errore con codice **401**:
```json
{
  "error": "Unauthorized: Token mancante"
}
```

oppure
```json
{
  "error": "Unauthorized: Token non valido o scaduto"
}
```

Se l'utente non è admin, viene restituito un errore con codice **403**:
```json
{
  "error": "Forbidden: Privilegi insufficienti"
}
```

Per input non valido, viene restituito un errore con codice **400**:
```json
{
  "error": "Bad Request: Username valido e numero di token ≥ 0 richiesto"
}
```

Per utente non esistente, viene restituito un errore con codice **404**:
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

### PATCH: /admin/requests/:id/reject

Permette a un amministratore autenticato di rifiutare una richiesta di brano in stato waiting, impostando il suo stato su rejected.

**Richiesta**

Richiede un token JWT valido con ruolo admin nell’header Authorization:
```http
PATCH /admin/requests/42/reject
Authorization: Bearer <JWT>
```

**Meccanismo**

Il meccanismo è il seguente:
- Il middleware authenticateToken verifica il token JWT e recupera l’ID utente.
- Il middleware authenticateAdmin controlla che il ruolo dell’utente sia admin.
- Il middleware checkRequestWaiting verifica che la richiesta sia in stato waiting.
- Il middleware validateTokenAmount valida il campo tokensToAdd (intero ≥ 0).
- Il controller rejectRequest:
  - Cambia lo stato della richiesta da waiting a rejected.
  - Salva la modifica.
  - Restituisce un messaggio di conferma.

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

  Client->>App: PATCH /admin/requests/:id/reject

  App->>Middleware: authenticateToken
  Middleware->>JWTService: verify(token)
  JWTService-->>Middleware: payload
  Middleware-->>App: next()

  App->>Middleware: authenticateAdmin
  Middleware-->>App: next()

  App->>Middleware: checkRequestWaiting
  Middleware->>DB: Request.findByPk(:id)
  DB-->>Middleware: stato = "waiting"
  Middleware-->>App: next()

  App->>Controller: rejectRequest
  Controller->>DB: Request.update(status = "rejected")
  DB-->>Controller: ok
  Controller-->>App: res.status(200).json({ message })

  App->>Client: res.status(200)
  App->>Client: { "message": "Richiesta rifiutata" }
```

**Risposta in caso di successo**

```json
{
  "message": "Richiesta rifiutata"
}
```

**Risposta in caso di errore**

Se token mancante o non valido, viene restituito un errore con codice **401**:
```json
{
  "error": "Unauthorized: Token mancante"
}
```

oppure
```json
{
  "error": "Unauthorized: Token non valido o scaduto"
}
```

Se l'utente non è admin, viene restituito un errore con codice **403**:
```json
{
  "error": "Forbidden: Privilegi insufficienti"
}
```

Se il campo tokensToAdd è assente o non valido, viene restituito un errore con codice **400**:
```json
{
  "error": "Bad Request: Numero di token non valido"
}
```

Se la richiesta non è in stato waiting, viene restituito un errore con codice **409**:
```json
{
  "error": "Conflict: La richiesta non è più approvabile"
}
```

Se la richiesta non è stata trovata, viene restituito un errore con codice **404**:
```json
{
  "error": "Not Found: Richiesta non trovata"
}
```

Per altri errori lato server viene restituito un errore con codice **500** e un messaggio generico:

```json
{
  "error": "Errore del server"
}
```


## Testing

Per testare il progetto correttamente, è importante seguire alcuni passaggi chiave per configurare l’ambiente di sviluppo e avviare i test in modo efficace. Ecco una guida nei seguenti passaggi:

1. **Scarica il progetto**: Clona il repository tramite URL Git oppure scarica il file ZIP ed estrailo.
2. **Importa le richieste API**: Apri Visual Studio Code e usa l’estensione *Thunder Client* per importare il file con le chiamate API contenuto nella cartella `collection` dentro la cartella `backend`.
3. **Configura l’ambiente**: Compila il file `.env` con i dati richiesti, prendendo come riferimento l’esempio fornito nel file `.env.example`.
4. **Installa Docker**: Se non lo hai già fatto, scarica Docker dal sito ufficiale e installalo per gestire i container del progetto.
5. **Avvia i servizi**: Apri un terminale nella cartella backend e lancia il comando:
  ```bash
docker-compose up --build
```
6. **Esegui i test**: Utilizza *Thunder Client* direttamente da Visual Studio Code per inviare richieste alle API ed esaminare le risposte.

Ricorda di fare riferimento alla documentazione del progetto per ulteriori dettagli, chiarimenti o passaggi specifici. Seguire correttamente le istruzioni ti aiuterà a configurare l’ambiente, eseguire i test e verificare che tutto funzioni come previsto.
