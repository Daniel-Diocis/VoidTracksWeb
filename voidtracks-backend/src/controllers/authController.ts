import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import fs from 'fs';

const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH || './private.key', 'utf8');

export async function register(req: Request, res: Response) {
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

    const newUser = await User.create({
      username,
      password_hash,
      tokens: 10,
      role: 'user',
    });

    const token = jwt.sign(
      { 
        id: newUser.id, 
        username: newUser.username, 
        role: newUser.role, 
        tokens: newUser.tokens 
      },
      privateKey,
      { 
        algorithm: 'RS256', 
        expiresIn: '1h' 
      }
    );

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        tokens: newUser.tokens,
      },
    });
  } catch (error) {
    console.error('Errore registrazione:', error);
    return res.status(500).json({ error: 'Errore del server' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username e password sono obbligatori' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role, 
        tokens: user.tokens 
      },
      privateKey,
      { 
        algorithm: 'RS256', 
        expiresIn: '1h'
      }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        tokens: user.tokens,
      },
    });
  } catch (error) {
    console.error('Errore login:', error);
    return res.status(500).json({ error: 'Errore del server' });
  }
}

export async function getPrivateUser(req: Request, res: Response) {
  const userPayload = (req as any).user;

  if (!userPayload) {
    return res.status(401).json({ error: 'Utente non autenticato' });
  }

  try {
    const user = await User.findByPk(userPayload.id);

    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        tokens: user.tokens,
      },
    });
  } catch (error) {
    console.error('Errore in /auth/private:', error);
    res.status(500).json({ error: 'Errore del server' });
  }
}

export function logout(req: Request, res: Response) {
  return res.json({ message: 'Logout eseguito con successo' });
}