import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User';
import Track from '../models/Track';
import Purchase from '../models/Purchase';
import { authenticateToken } from '../middleware/authenticateToken';
import { Op } from 'sequelize';

const router = Router();

// POST /purchase - Acquista un brano (autenticazione richiesta)
router.post('/purchase', authenticateToken, async (req: Request, res: Response) => {
  try {
    // l'utente è disponibile su req.user grazie a authenticateToken
    const userId = (req as any).user.id;
    const { track_id } = req.body;

    if (!track_id) {
      return res.status(400).json({ error: 'track_id è obbligatorio' });
    }

    // Recupera utente e brano dal DB
    const user = await User.findByPk(userId);
    const track = await Track.findByPk(track_id);

    if (!user || !track) {
      return res.status(404).json({ error: 'Utente o brano non trovato' });
    }

    // Controlla se esiste già un acquisto valido non usato e non scaduto
    const existingPurchase = await Purchase.findOne({
    where: {
        user_id: userId,
        track_id,
        used_flag: false,
        valid_until: { [Op.gt]: new Date() }, // ancora valido
    },
    });

    if (existingPurchase) {
    return res.status(200).json({
        message: 'Acquisto già presente e valido',
        purchase_id: existingPurchase.id,
        download_token: existingPurchase.download_token,
    });
    }

    // Verifica token sufficienti
    if (user.tokens < track.costo) {
      return res.status(401).json({ error: 'Token insufficienti per l\'acquisto' });
    }

    // Decrementa token
    user.tokens -= track.costo;
    await user.save();

    // Crea record acquisto
    const purchase = await Purchase.create({
      user_id: userId,
      track_id,
      purchased_at: new Date(),
      valid_until: new Date(Date.now() + 10 * 60 * 1000), // +10 minuti
      used_flag: false,
      costo: track.costo,
      download_token: uuidv4(), // generiamo un token per il link download (assumendo lo hai nel modello)
    });

    return res.status(201).json({
      message: 'Acquisto completato con successo',
      purchase_id: purchase.id,
      download_token: purchase.download_token,
    });
  } catch (error) {
    console.error('Errore nell\'acquisto:', error);
    if (error instanceof Error) {
    return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Errore del server durante l\'acquisto' });
  }
});

// GET /purchase/download/:download_token - Scarica un brano tramite link temporaneo
router.get('/purchase/download/:download_token', async (req: Request, res: Response) => {
  try {
    const { download_token } = req.params;

    const purchase = await Purchase.findOne({
      where: { download_token },
      include: [Track],
    });

    if (!purchase) {
      return res.status(404).json({ error: 'Link di download non valido' });
    }

    if (purchase.used_flag) {
      return res.status(403).json({ error: 'Link già utilizzato' });
    }

    if (new Date() > purchase.valid_until) {
      return res.status(403).json({ error: 'Link scaduto' });
    }

    // Marca come usato
    purchase.used_flag = true;
    await purchase.save();

    // Redirect al file audio (modifica URL se serve)
    const fileUrl = `https://igohvppfcsipbmzpckei.supabase.co/storage/v1/object/public/music/${purchase.Track!.music_path}`;

    return res.redirect(fileUrl);

  } catch (error) {
    console.error('Errore download:', error);
    return res.status(500).json({ error: 'Errore del server durante il download' });
  }
});

// GET /purchases - Lista acquisti utente autenticato, con filtri opzionali per date e stato
router.get('/purchases', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { fromDate, toDate, used } = req.query;

    const whereClause: any = {
      user_id: userId,
    };

    if (fromDate) {
      whereClause.purchased_at = { ...(whereClause.purchased_at || {}), [Op.gte]: new Date(fromDate as string) };
    }
    if (toDate) {
      whereClause.purchased_at = { ...(whereClause.purchased_at || {}), [Op.lte]: new Date(toDate as string) };
    }
    if (used !== undefined) {
      whereClause.used_flag = used === 'true';
    }

    const purchases = await Purchase.findAll({
      where: whereClause,
      include: [Track],
      order: [['purchased_at', 'DESC']],
    });

    res.json(purchases);
  } catch (error) {
    console.error('Errore nel recupero acquisti:', error);
    res.status(500).json({ error: 'Errore del server nel recupero acquisti' });
  }
});

export default router;