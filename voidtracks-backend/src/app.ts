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
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Abilita CORS per accettare richieste da origini diverse
app.use(cors());

// Parsing JSON per le richieste in ingresso
app.use(express.json());

// Logger delle richieste in modalità di sviluppo
app.use(morgan("dev"));

// Rotta di base per testare che l'API sia attiva
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

// Middleware per la gestione centralizzata degli errori
app.use(errorHandler);

export default app;