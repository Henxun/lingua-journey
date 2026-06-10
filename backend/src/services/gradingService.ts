import { Question, CEFRLevel } from '../entities/Assessment';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GradingResult {
  isCorrect: boolean;
  score: number;
  feedback: string;
}

export interface Answer {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  score?: number;
  feedback?: string;
}

export type SkillScores = Record<string, number>;

export function gradeMultipleChoice(
  question: Question,
  userAnswer: string
): GradingResult {
  const isCorrect = String(userAnswer).toLowerCase() === String(question.correctAnswer).toLowerCase();
  const score = isCorrect ? 10 : 0;

  return {
    isCorrect,
    score,
    feedback: isCorrect
      ? 'Excellent! You got it right!'
      : `Not quite. The correct answer is ${question.correctAnswer}.`
  };
}

export function gradeFillBlank(
  question: Question,
  userAnswer: string
): GradingResult {
  const normalizedUser = userAnswer.toLowerCase().trim();
  const correctAnswer = Array.isArray(question.correctAnswer) 
    ? question.correctAnswer.join(',') 
    : (question.correctAnswer || '');
  const normalizedCorrect = correctAnswer.toLowerCase().trim();
  const isCorrect = normalizedUser === normalizedCorrect;
  const score = isCorrect ? 10 : 0;

  return {
    isCorrect,
    score,
    feedback: isCorrect
      ? 'Perfect!'
      : `Close! The correct answer is "${question.correctAnswer}".`
  };
}

export async function gradeOpenEnded(
  question: Question,
  userAnswer: string,
  level: CEFRLevel
): Promise<GradingResult> {
  try {
    const prompt = `Grade this ${level} level answer to the question: "${question.question}"

Student answer: "${userAnswer}"

Please provide:
- A score 0-10 (10 being perfect)
- Detailed feedback
- Is it mostly correct (true/false)

Return JSON with fields: score (number), feedback (string), isCorrect (boolean)`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error('No response');

    const data = JSON.parse(content);
    return {
      isCorrect: data.isCorrect,
      score: Math.round((data.score / 10) * 10),
      feedback: data.feedback
    };
  } catch {
    return {
      isCorrect: userAnswer.length > 10,
      score: userAnswer.length > 10 ? 7 : 0,
      feedback: 'Thanks for your response!'
    };
  }
}

export async function gradeAnswer(
  question: Question,
  userAnswer: string,
  level: CEFRLevel
): Promise<GradingResult> {
  switch (question.type) {
    case 'multiple_choice':
      return gradeMultipleChoice(question, userAnswer);
    case 'fill_in_blank':
      return gradeFillBlank(question, userAnswer);
    case 'short_answer':
      return gradeOpenEnded(question, userAnswer, level);
    default:
      return { isCorrect: false, score: 0, feedback: 'Invalid question type' };
  }
}

export function calculateSkillScores(
  questions: Question[],
  answers: Answer[]
): SkillScores {
  const skillScoreMap: Record<string, { total: number; earned: number }> = {};

  for (const question of questions) {
    if (!skillScoreMap[question.skill]) {
      skillScoreMap[question.skill] = { total: 0, earned: 0 };
    }
    skillScoreMap[question.skill].total += 10;
    
    const answer = answers.find(a => a.questionId === question.id);
    if (answer) {
      skillScoreMap[question.skill].earned += answer.score || 0;
    }
  }

  const result: SkillScores = {};
  for (const [skill, scores] of Object.entries(skillScoreMap)) {
    result[skill] = scores.total > 0 
      ? Math.round((scores.earned / scores.total) * 100)
      : 0;
  }

  return result;
}

export function calculateOverallScore(skillScores: SkillScores): number {
  const scores = Object.values(skillScores);
  return scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
}

export function determineRecommendedLevel(score: number): CEFRLevel {
  if (score >= 90) return 'C2';
  if (score >= 80) return 'C1';
  if (score >= 70) return 'B2';
  if (score >= 60) return 'B1';
  if (score >= 50) return 'A2';
  return 'A1';
}