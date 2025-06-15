import { Router } from 'express';
const router = Router();

router.get('/', (_req, res) => {
  res.send('Test route');
});

export default router;