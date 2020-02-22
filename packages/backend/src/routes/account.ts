import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.send('account reached!'); // TODO
});

export default router;
