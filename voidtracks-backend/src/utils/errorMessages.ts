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

    INVALID_TRACK_NAME: { status: StatusCodes.BAD_REQUEST, message: "Nome brano non valido." },
    DUPLICATE_REQUEST: { status: StatusCodes.CONFLICT, message: "Richiesta già presente e in attesa." },
    ALREADY_VOTED: { status: StatusCodes.CONFLICT, message: "Hai già votato questa richiesta." },
    NOT_VOTED: { status: StatusCodes.NOT_FOUND, message: "Non hai votato questa richiesta." },
    
    INTERNAL_ERROR: { status: StatusCodes.INTERNAL_SERVER_ERROR, message: "Errore del server" },
} as const;