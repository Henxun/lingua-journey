import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Scene } from '../entities/Scene';
import { SceneObject } from '../entities/SceneObject';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

const objectLearningPrompts: { [key: string]: string } = {
  restaurant: 'Generate vocabulary, grammar patterns, and a sample dialogue for ordering food at a restaurant in a {language} speaking country.',
  cafe: 'Generate vocabulary, grammar patterns, and a sample dialogue for ordering coffee and snacks at a cafe in a {language} speaking country.',
  hotel: 'Generate vocabulary, grammar patterns, and a sample dialogue for checking into a hotel in a {language} speaking country.',
  shop: 'Generate vocabulary, grammar patterns, and a sample dialogue for shopping at a store in a {language} speaking country.',
  market: 'Generate vocabulary, grammar patterns, and a sample dialogue for bargaining at a local market in a {language} speaking country.',
  bank: 'Generate vocabulary, grammar patterns, and a sample dialogue for banking transactions in a {language} speaking country.',
  hospital: 'Generate vocabulary, grammar patterns, and a sample dialogue for visiting a doctor in a {language} speaking country.',
  school: 'Generate vocabulary, grammar patterns, and a sample dialogue for attending class in a {language} speaking country.',
  airport: 'Generate vocabulary, grammar patterns, and a sample dialogue for checking in at an airport in a {language} speaking country.',
  station: 'Generate vocabulary, grammar patterns, and a sample dialogue for buying tickets at a train station in a {language} speaking country.',
};

export async function getLearningContent(req: Request, res: Response) {
  try {
    const { id, objectId } = req.params;

    const scene = await sceneRepository.findOne({
      where: { id, is_active: true },
      relations: ['objects']
    });

    if (!scene) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    const sceneObject = scene.objects.find(obj => obj.id === objectId);
    
    if (!sceneObject) {
      return res.status(404).json({ error: 'Object not found' });
    }

    const language = 'English';
    const promptTemplate = objectLearningPrompts[sceneObject.name.toLowerCase()] 
      || `Generate vocabulary, grammar patterns, and a sample dialogue related to "${sceneObject.name}" in a ${language} learning context.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert language learning content creator. Create engaging, level-appropriate learning content for language learners.`
        },
        {
          role: 'user',
          content: promptTemplate.replace('{language}', language)
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const content = completion.choices[0].message.content || '';
    
    const vocabularyMatch = content.match(/vocabulary[:\-\s]*(.+?)(?=grammar|$)/is);
    const grammarMatch = content.match(/grammar[:\-\s]*(.+?)(?=dialogue|$)/is);
    const dialogueMatch = content.match(/dialogue[:\-\s]*(.+?)$/is);

    const vocabulary = vocabularyMatch 
      ? vocabularyMatch[1].split(/[,\n]/).map(v => v.trim()).filter(Boolean)
      : ['Hello', 'Goodbye', 'Thank you'];
    
    const grammar = grammarMatch 
      ? grammarMatch[1].split(/[,\n]/).map(g => g.trim()).filter(Boolean)
      : ['Basic greeting patterns', 'Polite expressions'];
    
    const dialogue = dialogueMatch 
      ? dialogueMatch[1].trim()
      : `Hello! Welcome to ${sceneObject.name}. How can I help you today?`;

    const culturalTipMatch = content.match(/cultural tip[:\-\s]*(.+?)$/is);
    const culturalTip = culturalTipMatch ? culturalTipMatch[1].trim() : undefined;

    res.status(200).json({
      vocabulary,
      grammar,
      dialogue,
      culturalTip
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function generateSceneDescription(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const scene = await sceneRepository.findOne({
      where: { id, is_active: true },
      relations: ['objects']
    });

    if (!scene) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    const interactiveObjects = scene.objects.filter(o => o.interactive);
    const objectNames = interactiveObjects.map(o => o.name).join(', ');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a creative storyteller describing immersive language learning scenes.'
        },
        {
          role: 'user',
          content: `Describe the scene "${scene.name}" (${scene.type}) for a language learner. This scene contains these interactive objects: ${objectNames || 'various items'}. 
          
          Create an engaging, evocative description that:
          1. Sets the atmosphere and setting
          2. Describes the interactive objects learners can explore
          3. Mentions the language learning opportunities available
          4. Encourages exploration and practice
          
          Keep it to 2-3 short paragraphs.`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const description = completion.choices[0].message.content || scene.description;

    res.status(200).json({ description });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function generateObjectDialogue(req: Request, res: Response) {
  try {
    const { id, objectId } = req.params;
    const { context } = req.body;

    const scene = await sceneRepository.findOne({
      where: { id, is_active: true },
      relations: ['objects']
    });

    if (!scene) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    const sceneObject = scene.objects.find(obj => obj.id === objectId);
    
    if (!sceneObject) {
      return res.status(404).json({ error: 'Object not found' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a creative language learning dialogue generator. Create natural, conversational dialogues appropriate for language learners.'
        },
        {
          role: 'user',
          content: `Create a natural dialogue scene for a language learner at "${sceneObject.name}" in a ${scene.type} setting.
          
          Context: ${context || 'General conversation and interaction'}
          
          The dialogue should:
          1. Be 4-6 exchanges long
          2. Use beginner-friendly language (A1-A2 level)
          3. Include common phrases and practical vocabulary
          4. Show cultural nuances where appropriate
          
          Format as a natural conversation with simple labels like "Person A:" and "Person B:"`
        }
      ],
      temperature: 0.8,
      max_tokens: 600
    });

    const dialogue = completion.choices[0].message.content || 
      `Person A: Hello! Welcome to ${sceneObject.name}.\nPerson B: Hello! Thank you.\nPerson A: How can I help you today?\nPerson B: I would like to learn about ${sceneObject.name}.`;

    res.status(200).json({ dialogue });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}