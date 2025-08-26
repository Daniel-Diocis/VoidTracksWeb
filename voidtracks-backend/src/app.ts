import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cors from "cors";

// Importa i router delle varie sezioni dell'app
import tracksRouter from "./routes/tracks";
import authRouter from "./routes/auth";
import purchaseRouter from "./routes/purchase";
import playlistRouter from "./routes/playlist";
import adminRouter from "./routes/admin";
import artistsRouter from "./routes/artists";
import requestRouter from "./routes/requests";
import { errorHandler } from "./middleware/errorHandler";

// Crea un'istanza di Express
const app = express();

// Abilita CORS per accettare richieste da origini diverse
app.use(cors());

// Parsing JSON per le richieste in ingresso
app.use(express.json());

// Logger delle richieste in modalità di sviluppo
app.use(morgan("dev"));

// Rotta di default per verificare che l'API sia in esecuzione
app.get("/", (_req: Request, res: Response) => {
  res.send("API is running");
});

// Monta i router sulle rispettive rotte
app.use("/tracks", tracksRouter);
app.use("/auth", authRouter);
app.use("/purchase", purchaseRouter);
app.use("/playlists", playlistRouter);
app.use("/admin", adminRouter);
app.use("/artists", artistsRouter);
app.use("/requests", requestRouter);

// Middleware per la gestione centralizzata degli errori
app.use(errorHandler);

export default app;