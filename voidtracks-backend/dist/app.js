"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
// Importa i router delle varie sezioni dell'app
const tracks_1 = __importDefault(require("./routes/tracks"));
const auth_1 = __importDefault(require("./routes/auth"));
const purchase_1 = __importDefault(require("./routes/purchase"));
const playlist_1 = __importDefault(require("./routes/playlist"));
const admin_1 = __importDefault(require("./routes/admin"));
const artists_1 = __importDefault(require("./routes/artists"));
const requests_1 = __importDefault(require("./routes/requests"));
const errorHandler_1 = require("./middleware/errorHandler");
// Crea un'istanza di Express
const app = (0, express_1.default)();
// Abilita CORS per accettare richieste da origini diverse
app.use((0, cors_1.default)());
// Parsing JSON per le richieste in ingresso
app.use(express_1.default.json());
// Logger delle richieste in modalità di sviluppo
app.use((0, morgan_1.default)("dev"));
// Rotta di default per verificare che l'API sia in esecuzione
app.get("/", (_req, res) => {
    res.send("API is running");
});
// Monta i router sulle rispettive rotte
app.use("/tracks", tracks_1.default);
app.use("/auth", auth_1.default);
app.use("/purchase", purchase_1.default);
app.use("/playlists", playlist_1.default);
app.use("/admin", admin_1.default);
app.use("/artists", artists_1.default);
app.use("/requests", requests_1.default);
// Middleware per la gestione centralizzata degli errori
app.use(errorHandler_1.errorHandler);
exports.default = app;
