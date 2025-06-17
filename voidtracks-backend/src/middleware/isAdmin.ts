import { Request, Response, NextFunction } from 'express';

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;

  if (user && user.role === 'admin') {
    return next();
  }

  return res.status(403).json({ error: 'Accesso riservato agli amministratori' });
}