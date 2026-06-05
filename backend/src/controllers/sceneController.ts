import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Scene } from '../entities/Scene';
import { SceneObject } from '../entities/SceneObject';

const sceneRepository = AppDataSource.getRepository(Scene);
const sceneObjectRepository = AppDataSource.getRepository(SceneObject);

export async function getScenes(req: Request, res: Response) {
  try {
    const scenes = await sceneRepository.find({
      where: { is_active: true },
      relations: ['objects']
    });

    res.status(200).json(scenes);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getScene(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const scene = await sceneRepository.findOne({
      where: { id, is_active: true },
      relations: ['objects']
    });

    if (!scene) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    res.status(200).json(scene);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getSceneObjects(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const objects = await sceneObjectRepository.find({
      where: { scene_id: id }
    });

    res.status(200).json(objects);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function interactWithScene(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { object_id } = req.body;

    const scene = await sceneRepository.findOne({
      where: { id, is_active: true },
      relations: ['objects']
    });

    if (!scene) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    const sceneObject = scene.objects.find(obj => obj.id === object_id);
    
    if (!sceneObject) {
      return res.status(404).json({ error: 'Object not found' });
    }

    if (!sceneObject.interactive) {
      return res.status(400).json({ error: 'Object is not interactive' });
    }

    res.status(200).json({
      message: `Interacted with ${sceneObject.name}`,
      action: sceneObject.trigger_action,
      object: sceneObject
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}