import { Request, Response } from "express";
import axios, { AxiosResponse } from "axios";
import { v4 as uuidv4 } from "uuid";
import { Readable } from "stream";
import User from "../models/User";
import Track from "../models/Track";
import Purchase from "../models/Purchase";
import { Op } from "sequelize";

export async function createPurchase(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { track_id } = req.body;

    if (!track_id) {
      return res.status(400).json({ error: "track_id è obbligatorio" });
    }

    const user = await User.findByPk(userId);
    const track = await Track.findByPk(track_id);

    if (!user) return res.status(404).json({ error: "Utente non trovato" });
    if (!track) return res.status(404).json({ error: "Brano non trovato" });

    const existingPurchase = await Purchase.findOne({
      where: {
        user_id: userId,
        track_id,
        used_flag: false,
        valid_until: { [Op.gt]: new Date() },
      },
    });

    if (existingPurchase) {
      return res.status(200).json({
        message: "Acquisto già presente e valido",
        purchase_id: existingPurchase.id,
        download_token: existingPurchase.download_token,
      });
    }

    if (user.tokens < track.costo) {
      return res
        .status(401)
        .json({ error: "Token insufficienti per l'acquisto" });
    }

    user.tokens -= track.costo;
    await user.save();

    const purchase = await Purchase.create({
      user_id: userId,
      track_id,
      purchased_at: new Date(),
      valid_until: new Date(Date.now() + 10 * 60 * 1000),
      used_flag: false,
      costo: track.costo,
      download_token: uuidv4(),
    });

    res.status(201).json({
      message: "Acquisto completato con successo",
      purchase_id: purchase.id,
      download_token: purchase.download_token,
    });
  } catch (error) {
    console.error("Errore nell'acquisto:", error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res
      .status(500)
      .json({ error: "Errore del server durante l'acquisto" });
  }
}

export async function downloadTrack(req: Request, res: Response) {
  try {
    const { download_token } = req.params;

    const purchase = await Purchase.findOne({
      where: { download_token },
      include: [Track],
    });

    if (!purchase)
      return res.status(404).json({ error: "Link di download non valido" });
    if (purchase.used_flag)
      return res.status(403).json({ error: "Link già utilizzato" });
    if (new Date() > purchase.valid_until)
      return res.status(403).json({ error: "Link scaduto" });

    purchase.used_flag = true;
    await purchase.save();

    const fileUrl = `https://igohvppfcsipbmzpckei.supabase.co/storage/v1/object/public/music/${
      purchase.Track!.music_path
    }`;

    try {
      const response: AxiosResponse<Readable> = await axios.get(fileUrl, {
        responseType: "stream",
      });

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${purchase.Track!.titolo.replace(
          /[^a-z0-9]/gi,
          "_"
        )}.mp3"`
      );
      res.setHeader("Content-Type", "audio/mpeg");

      response.data.pipe(res);
    } catch (err: any) {
      console.error("Errore Axios:", err.response?.status, err.response?.data);
      res
        .status(500)
        .json({ error: "Download fallito: file non raggiungibile o rimosso." });
    }
  } catch (error) {
    console.error("Errore durante il download:", error);
    res.status(500).json({ error: "Errore del server durante il download" });
  }
}

export async function getUserPurchases(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { fromDate, toDate } = req.query;

    const whereClause: any = { user_id: userId };

    if (fromDate) {
      whereClause.purchased_at = {
        ...(whereClause.purchased_at || {}),
        [Op.gte]: new Date(fromDate as string),
      };
    }

    if (toDate) {
      whereClause.purchased_at = {
        ...(whereClause.purchased_at || {}),
        [Op.lte]: new Date(toDate as string),
      };
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
    res.status(500).json({ error: "Errore del server nel recupero acquisti" });
  }
}

export async function getPurchaseDetails(req: Request, res: Response) {
  try {
    const { download_token } = req.params;

    const purchase = await Purchase.findOne({
      where: { download_token },
      include: [Track],
    });

    if (!purchase || !purchase.Track) {
      return res.status(404).json({ error: "Token non valido" });
    }

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
    res.status(500).json({ error: "Errore interno" });
  }
}
