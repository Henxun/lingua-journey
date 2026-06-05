import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getScenes,
  getScene,
  getSceneObjects,
  interactWithScene
} from '../controllers/sceneController';

const router = Router();

router.get('/list', authenticate, getScenes);
router.get('/:id', authenticate, getScene);
router.get('/:id/objects', authenticate, getSceneObjects);
router.post('/:id/interact', authenticate, interactWithScene);

export default router;