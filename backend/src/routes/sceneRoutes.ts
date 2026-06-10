import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getScenes,
  getScene,
  getSceneObjects,
  interactWithScene,
  getLearningContent,
  generateSceneDescription,
  generateObjectDialogue
} from '../controllers/sceneController';

const router = Router();

router.get('/list', authenticate, getScenes);
router.get('/:id', authenticate, getScene);
router.get('/:id/objects', authenticate, getSceneObjects);
router.post('/:id/interact', authenticate, interactWithScene);
router.get('/:id/objects/:objectId/learning-content', authenticate, getLearningContent);
router.post('/:id/describe', authenticate, generateSceneDescription);
router.post('/:id/objects/:objectId/dialogue', authenticate, generateObjectDialogue);

export default router;