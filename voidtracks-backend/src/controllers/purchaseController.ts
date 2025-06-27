import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import axios, { AxiosResponse } from "axios";
import { v4 as uuidv4 } from "uuid";
import { Readable } from "stream";
import { Op } from "sequelize";
import { StatusCodes } from "http-status-codes";
import { ErrorMessages } from "../utils/errorMessages";
import { MessageFactory } from "../utils/messageFactory";
import User from "../models/User";
import Track from "../models/Track";
import Purchase from "../models/Purchase";

dotenv.config();

const FILE_URL = process.env.FILE_URL;
const factory = new MessageFactory();

/**
 * Effettua l'acquisto di un brano musicale.
 *
 * - Scala il numero di token disponibili all'utente.
 * - Registra l'acquisto nel database.
 * - Genera un token temporaneo valido 10 minuti per il download.
 *
 * @param req - Richiesta HTTP contenente `userInstance` e `trackInstance` (iniettati dal middleware).
 * @param res - Risposta HTTP contenente ID acquisto e token di download.
 * @returns Risposta JSON con conferma acquisto e token.
 */
export async function createPurchase(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).userInstance;
    const track = (req as any).trackInstance;

    user.tokens -= track.costo;
    await user.save();

    const purchase = await Purchase.create({
      user_id: user.id,
      track_id: track.id,
      purchased_at: new Date(),
      valid_until: new Date(Date.now() + 10 * 60 * 1000),
      used_flag: false,
      costo: track.costo,
      download_token: uuidv4(),
    });

    res.status(StatusCodes.CREATED).json({
      message: "Acquisto completato con successo",
      purchase_id: purchase.id,
      download_token: purchase.download_token,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Scarica il brano acquistato utilizzando il token di download.
 *
 * - Marca il token come usato (`used_flag`).
 * - Restituisce il file audio in streaming con intestazioni appropriate.
 *
 * @param req - Richiesta HTTP con `purchaseInstance` popolato dal middleware.
 * @param res - Risposta HTTP con il file MP3 in streaming.
 */
export async function downloadTrack(req: Request, res: Response, next: NextFunction) {
  try {
    const purchase = (req as any).purchaseInstance;

    purchase.used_flag = true;
    await purchase.save();

    const fileUrl = `${FILE_URL}${purchase.Track!.music_path}`;
    const response: AxiosResponse<Readable> = await axios.get(fileUrl, { responseType: "stream" });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${purchase.Track!.titolo.replace(/[^a-z0-9]/gi, "_")}.mp3"`
    );
    res.setHeader("Content-Type", "audio/mpeg");

    response.data.pipe(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Restituisce tutti gli acquisti effettuati da un utente.
 *
 * - È possibile filtrare gli acquisti tramite `fromDate` e `toDate` (opzionali).
 *
 * @param req - Richiesta HTTP contenente `user.id` e filtri opzionali tramite query string.
 * @param res - Risposta HTTP con l’elenco degli acquisti effettuati.
 */
export async function getUserPurchases(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { fromDate, toDate } = req.query;

    const whereClause: any = { user_id: userId };
    const purchasedAtConditions: any = {};

    if (fromDate) purchasedAtConditions[Op.gte] = new Date(fromDate as string);
    if (toDate) purchasedAtConditions[Op.lte] = new Date(toDate as string);
    if (Object.keys(purchasedAtConditions).length > 0) {
      whereClause.purchased_at = purchasedAtConditions;
    }

    const purchases = await Purchase.findAll({
      where: whereClause,
      include: [Track],
      order: [["purchased_at", "DESC"]],
    });

    res.json({
      message: `Trovati ${purchases.length} acquisti`,
      data: purchases,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Restituisce i dettagli di un acquisto tramite il token di download.
 *
 * - Verifica se il download è ancora disponibile (token valido e non ancora utilizzato).
 *
 * @param req - Richiesta HTTP contenente `purchaseInstance` fornito dal middleware.
 * @param res - Risposta HTTP con i dettagli del brano e il flag `canDownload`.
 */
export async function getPurchaseDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const purchase = (req as any).purchaseInstance;

    const now = new Date();
    const canDownload = !purchase.used_flag && now < purchase.valid_until;

    res.json({
      titolo: purchase.Track.titolo,
      artista: purchase.Track.artista,
      album: purchase.Track.album,
      cover_path: purchase.Track.cover_path,
      canDownload,
    });
  } catch (error) {
    next(error);
  }
}