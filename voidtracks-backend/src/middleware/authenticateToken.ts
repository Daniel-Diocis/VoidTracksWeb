import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: number;
  username: string;
  role: string;
  tokens: number;
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token mancante' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, payload) => {
    if (err) {
      return res.status(403).json({ error: 'Token non valido o scaduto' });
    }

    (req as any).user = payload as JwtPayload;

    next();
  });
}