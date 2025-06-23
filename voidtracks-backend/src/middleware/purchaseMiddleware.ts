import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import User from "../models/User";
import Track from "../models/Track";
import Purchase from "../models/Purchase";

/**
 * Valida il corpo della richiesta per la rotta di acquisto.
 * Verifica che `track_id` sia presente e sia una stringa.
 *
 * @param req - Oggetto Request contenente il corpo della richiesta
 * @param res - Oggetto Response per inviare errori
 * @param next - Funzione per passare al middleware successivo
 */
export function validatePurchaseBody(req: Request, res: Response, next: NextFunction) {
  const { track_id } = req.body;
  if (!track_id || typeof track_id !== "string") {
    return res.status(400).json({ error: "Il campo 'track_id' è obbligatorio e deve essere una stringa" });
  }
  next();
}

/**
 * Verifica che l'utente e il brano indicati esistano nel database.
 * Salva le istanze nei campi `userInstance` e `trackInstance` della request.
 *
 * @param req - Oggetto Request con `user.id` e `track_id` dal body
 * @param res - Oggetto Response per inviare errori
 * @param next - Funzione per passare al middleware successivo
 */
export async function checkUserAndTrackExist(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user.id;
  const { track_id } = req.body;

  const user = await User.findByPk(userId);
  const track = await Track.findByPk(track_id);

  if (!user) return res.status(404).json({ error: "Utente non trovato" });
  if (!track) return res.status(404).json({ error: "Brano non trovato" });

  (req as any).userInstance = user;
  (req as any).trackInstance = track;
  next();
}

/**
 * Controlla se esiste già un acquisto valido per lo stesso brano e utente.
 * In caso positivo, ritorna subito con il token esistente evitando duplicati.
 *
 * @param req - Oggetto Request con `user.id` e `track_id` dal body
 * @param res - Oggetto Response con token esistente
 * @param next - Funzione per passare al middleware successivo
 */
export async function checkDuplicatePurchase(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).user.id;
  const { track_id } = req.body;

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

  next();
}

/**
 * Verifica che l'utente abbia abbastanza token per acquistare il brano.
 *
 * @param req - Oggetto Request contenente `userInstance` e `trackInstance`
 * @param res - Oggetto Response per errore se token insufficienti
 * @param next - Funzione per passare al middleware successivo
 */
export function checkUserTokens(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).userInstance;
  const track = (req as any).trackInstance;

  if (user.tokens < track.costo) {
    return res.status(401).json({ error: "Token insufficienti per l'acquisto" });
  }

  next();
}

/**
 * Valida il token di download prima di servire il file.
 * Verifica che il token:
 * - Esista
 * - Non sia già usato
 * - Non sia scaduto
 *
 * @param req - Oggetto Request con `download_token` nei parametri
 * @param res - Oggetto Response per eventuali errori
 * @param next - Funzione per passare al middleware successivo
 */
export async function validateDownloadToken(req: Request, res: Response, next: NextFunction) {
  const { download_token } = req.params;

  const purchase = await Purchase.findOne({
    where: { download_token },
    include: [Track],
  });

  if (!purchase) {
    return res.status(404).json({ error: "Link di download non valido" });
  }

  if (purchase.used_flag) {
    return res.status(403).json({ error: "Link già utilizzato" });
  }

  if (new Date() > purchase.valid_until) {
    return res.status(403).json({ error: "Link scaduto" });
  }

  (req as any).purchaseInstance = purchase;
  next();
}

/**
 * Carica l'acquisto corrispondente al `download_token` fornito.
 * Utilizzato per visualizzare i dettagli (non valida usabilità del token).
 *
 * @param req - Oggetto Request con `download_token` nei parametri
 * @param res - Oggetto Response per eventuali errori
 * @param next - Funzione per passare al middleware successivo
 */
export async function loadPurchaseByToken(req: Request, res: Response, next: NextFunction) {
  const { download_token } = req.params;

  const purchase = await Purchase.findOne({
    where: { download_token },
    include: [Track],
  });

  if (!purchase || !purchase.Track) {
    return res.status(404).json({ error: "Token non valido" });
  }

  (req as any).purchaseInstance = purchase;
  next();
}