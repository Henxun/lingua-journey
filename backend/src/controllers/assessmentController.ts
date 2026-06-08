import { Request, Response } from 'express';
import {
  createAssessment,
  getAssessment,
  getAvailableAssessments,
  submitAssessment,
  getUserResults,
  getUserSkillProfiles
} from '../services/assessmentService';

export async function createNewAssessment(req: Request, res: Response) {
  try {
    const { name, level, skills, timeLimit, passingScore } = req.body;
    const assessment = await createAssessment(name, level, skills, timeLimit, passingScore);
    res.status(201).json(assessment);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getAssessmentById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const assessment = await getAssessment(id);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    res.status(200).json(assessment);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function listAssessments(req: Request, res: Response) {
  try {
    const assessments = await getAvailableAssessments();
    res.status(200).json(assessments);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function submitAssessmentAnswers(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { answers } = req.body;
    const result = await submitAssessment(id, userId, answers);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getUserAssessmentResults(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const results = await getUserResults(userId);
    res.status(200).json(results);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getUserSkills(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const profiles = await getUserSkillProfiles(userId);
    res.status(200).json(profiles);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
