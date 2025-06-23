import dotenv from "dotenv";
import { Request, Response } from "express";
import axios, { AxiosResponse } from "axios";
import { v4 as uuidv4 } from "uuid";
import { Readable } from "stream";
import { Op } from "sequelize";
import { StatusCodes } from "http-status-codes";
import { MessageFactory } from "../utils/messageFactory";
import User from "../models/User";
import Track from "../models/Track";
import Purchase from "../models/Purchase";

dotenv.config();

const FILE_URL = process.env.FILE_URL;
const factory = new MessageFactory();

/**
 * Effettua l'acquisto di un brano.
 * - Scala i token dal saldo utente.
 * - Registra l'acquisto nel database.
 * - Genera un token temporaneo per il download.
 *
 * @param req - Richiesta HTTP contenente l'utente e il brano (dal middleware)
 * @param res - Risposta HTTP con i dati dell'acquisto
 * @returns JSON con ID acquisto e token di download
 */
export async function createPurchase(req: Request, res: Response) {
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
    console.error("Errore nell'acquisto:", error);
    factory.getStatusMessage(res, StatusCodes.INTERNAL_SERVER_ERROR, "Errore del server durante l'acquisto");
  }
}

/**
 * Permette il download del brano acquistato, utilizzando il token di download.
 * - Marca il token come usato.
 * - Serve il file audio in streaming.
 *
 * @param req - Richiesta HTTP con `purchaseInstance` popolato dal middleware
 * @param res - Risposta con il file MP3 in streaming
 */
export async function downloadTrack(req: Request, res: Response) {
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
  } catch (error: any) {
    console.error("Errore durante il download:", error);
    factory.getStatusMessage(res, StatusCodes.INTERNAL_SERVER_ERROR, "Errore del server durante il download");
  }
}

/**
 * Restituisce la lista degli acquisti effettuati da un utente.
 * - Permette filtri opzionali per intervallo di date (`fromDate`, `toDate`)
 *
 * @param req - Richiesta HTTP con l'utente autenticato (`user.id`) e filtri opzionali
 * @param res - Risposta JSON con elenco acquisti
 */

export async function getUserPurchases(req: Request, res: Response) {
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
    console.error("Errore nel recupero acquisti:", error);
    factory.getStatusMessage(res, StatusCodes.INTERNAL_SERVER_ERROR, "Errore del server nel recupero acquisti");
  }
}

/**
 * Restituisce i dettagli di un singolo acquisto tramite il token di download.
 * - Indica se l'utente può ancora effettuare il download (non scaduto, non usato).
 *
 * @param req - Richiesta HTTP contenente `purchaseInstance`
 * @param res - Risposta con dettagli brano e flag `canDownload`
 */
export async function getPurchaseDetails(req: Request, res: Response) {
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
    console.error("Errore GET /purchase/:token", error);
    factory.getStatusMessage(res, StatusCodes.INTERNAL_SERVER_ERROR, "Errore interno");
  }
}