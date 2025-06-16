import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import tracksRouter from './routes/tracks'; // attenzione al percorso se serve aggiustar
import authRouter from './routes/auth';
import testRouter from './routes/testRouter';
import purchaseRouter from './routes/purchase';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req: Request, res: Response) => {
  res.send('API is running');
});

app.use('/tracks', tracksRouter);
app.use('/auth', authRouter);
app.use('/test', testRouter);
app.use('/', purchaseRouter);

// gestione errori async (es. exportato da utils se vuoi)
export function asyncHandler(fn: Function) {
  return function (req: Request, res: Response, next: NextFunction) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Middleware globale gestione errori
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

export default app;