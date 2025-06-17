// routes/admin.ts
import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken';
import { isAdmin } from '../middleware/isAdmin';
import User from '../models/User';

const router = express.Router();

router.patch('/admin/recharge', authenticateToken, isAdmin, async (req, res) => {
  const { username, tokens } = req.body;

    if (!username || typeof username !== 'string' || typeof tokens !== 'number' || tokens < 0) {
    return res.status(400).json({ error: 'Username valido e numero di token >= 0 richiesto' });
    }

    try {
        const user = await User.findOne({ where: { username } });

        if (!user) {
        return res.status(404).json({ error: 'Utente non trovato' });
        }

    user.tokens = tokens;
    await user.save();

    return res.json({
      message: `Ricarica completata per ${user.username}`,
      tokens: user.tokens,
    });
  } catch (err) {
    console.error('Errore ricarica token:', err);
    return res.status(500).json({ error: 'Errore server durante la ricarica' });
  }
});

export default router;