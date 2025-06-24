"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessages = exports.CustomStatusCodes = void 0;
const http_status_codes_1 = require("http-status-codes");
const abc = http_status_codes_1.StatusCodes.BAD_REQUEST;
var CustomStatusCodes;
(function (CustomStatusCodes) {
    CustomStatusCodes[CustomStatusCodes["bad"] = 400] = "bad";
    CustomStatusCodes[CustomStatusCodes["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    CustomStatusCodes[CustomStatusCodes["not"] = 404] = "not";
    CustomStatusCodes[CustomStatusCodes["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    CustomStatusCodes[CustomStatusCodes["OK"] = 200] = "OK";
})(CustomStatusCodes || (exports.CustomStatusCodes = CustomStatusCodes = {}));
exports.ErrorMessages = {
    NOT_USER: { status: http_status_codes_1.StatusCodes.UNAUTHORIZED, message: "Accesso negato. Login richiesto." },
    NOT_ADMIN: { status: http_status_codes_1.StatusCodes.FORBIDDEN, message: "Privilegi insufficienti." },
    INVALID_RECHARGE_INPUT: { status: http_status_codes_1.StatusCodes.BAD_REQUEST, message: "Username valido e numero di token ≥ 0 richiesto" },
    USER_NOT_FOUND: { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Utente non trovato" },
    INVALID_ARTIST_NAME: { status: http_status_codes_1.StatusCodes.BAD_REQUEST, message: "Nome artista non valido" },
    ARTIST_NOT_FOUND: { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Artista non trovato" },
    MISSING_TOKEN: { status: http_status_codes_1.StatusCodes.UNAUTHORIZED, message: "Token mancante" },
    INVALID_TOKEN: { status: http_status_codes_1.StatusCodes.UNAUTHORIZED, message: "Token non valido o scaduto" },
    USERNAME_ALREADY_EXISTS: { status: http_status_codes_1.StatusCodes.CONFLICT, message: "Username già in uso" },
    INVALID_CREDENTIALS: { status: http_status_codes_1.StatusCodes.UNAUTHORIZED, message: "Credenziali non valide" },
    NOT_AUTHENTICATED_USER: { status: http_status_codes_1.StatusCodes.UNAUTHORIZED, message: "Utente non autenticato" },
    PLAYLIST_NOT_FOUND: { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Playlist non trovata o accesso negato" },
    TRACK_ID_MISSING: { status: http_status_codes_1.StatusCodes.BAD_REQUEST, message: "ID del brano mancante" },
    TRACK_NOT_PURCHASED: { status: http_status_codes_1.StatusCodes.FORBIDDEN, message: "Brano non acquistato" },
    TRACK_ALREADY_IN_PLAYLIST: { status: http_status_codes_1.StatusCodes.CONFLICT, message: "Brano già presente nella playlist" },
    TRACK_ID_VALIDATE: { status: http_status_codes_1.StatusCodes.BAD_REQUEST, message: "Il campo 'track_id' è obbligatorio e deve essere una stringa" },
    TRACK_NOT_FOUND: { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Brano non trovato" },
    UNSUFFICIENT_TOKENS: { status: http_status_codes_1.StatusCodes.UNAUTHORIZED, message: "Token insufficienti per l'acquisto" },
    INVALID_LINK: { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Link di download non valido" },
    ALREADY_USED_LINK: { status: http_status_codes_1.StatusCodes.FORBIDDEN, message: "Link già utilizzato" },
    EXPIRED_LINK: { status: http_status_codes_1.StatusCodes.FORBIDDEN, message: "Link scaduto" },
    INVALID_PURCHASE_TOKEN: { status: http_status_codes_1.StatusCodes.NOT_FOUND, message: "Token non valido" },
    Q_NOT_STRING: { status: http_status_codes_1.StatusCodes.BAD_REQUEST, message: "Il parametro 'q' deve essere una stringa" },
    INTERNAL_ERROR: { status: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message: "Errore del server" },
};
