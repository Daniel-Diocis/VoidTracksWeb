import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticateToken } from '../middleware/authenticateToken';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password sono obbligatori' });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ error: 'Username già in uso' });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    await User.create({
      username,
      password_hash,
      tokens: 10,
      role: 'user',
    });

    return res.status(201).json({ message: 'Utente creato con successo' });
  } catch (error) {
    console.error('Errore registrazione:', error);
    return res.status(500).json({ error: 'Errore del server' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username e password sono obbligatori' });
  }

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    // Genera token JWT (metti una secret forte nel .env)
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secretkey', 
      { expiresIn: '1h' }
    );

    return res.json({ token });
  } catch (error) {
    console.error('Errore login:', error);
    return res.status(500).json({ error: 'Errore del server' });
  }
});

router.get('/private', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ message: 'Accesso autorizzato!', user });
});


router.post('/logout', (req: Request, res: Response) => {
  // Per JWT stateless, logout lato server non serve invalidare nulla
  // Solo il client deve eliminare il token (es. localStorage)
  
  return res.json({ message: 'Logout eseguito con successo' });
});

export default router;