import { Request, Response, NextFunction } from 'express';

// Middleware per verificare che l'utente sia autenticato
export function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: 'Accesso negato. Login richiesto.' });
  next();
}

// Middleware per verificare che l'utente sia un autenticato e abbia ruolo admin
export function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: 'Accesso negato. Login richiesto.' });
  if (user.role !== 'admin') return res.status(403).json({ error: 'Accesso negato. Privilegi insufficienti.' });
  next();
}