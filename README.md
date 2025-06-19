# VoidTracksWeb

VoidTracksWeb è un'applicazione web per l'acquisto, la gestione e la riproduzione di brani musicali. 
Gli utenti possono registrarsi, acquistare token, scaricare brani tramite link temporanei e creare playlist personalizzate. 
Gli amministratori possono gestire gli utenti e ricaricare token.

## Rotte

La seguente tabella mostra le rotte:

| Metodo | Rotta                          | Parametri                          |
|--------|-------------------------------|----------------------------------|
| GET    | /                             | Nessuno                         |
| GET    | /tracks                       | Nessuno                         |
| GET    | /tracks/popular               | Nessuno                         |
| POST   | /auth/register                | username, password               |
| POST   | /auth/login                   | username, password               |
| GET    | /auth/private                 | token (header Authorization)    |
| POST   | /auth/logout                  | Nessuno                        |
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
