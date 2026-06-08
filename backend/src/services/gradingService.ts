import { Answer, Question, SkillScores, CEFRLevel, SkillType } from '../entities/Assessment';
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

export function gradeMultipleChoice(
  question: Question,
  userAnswer: string
): GradingResult {
  const isCorrect = userAnswer === question.correctAnswer;
  const score = isCorrect ? question.points : 0;

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
  const normalizedCorrect = (question.correctAnswer || '').toLowerCase().trim();
  const isCorrect = normalizedUser === normalizedCorrect;
  const score = isCorrect ? question.points : 0;

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
    const prompt = `Grade this ${level} level answer to the question: "${question.prompt}"

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
      score: Math.round((data.score / 10) * question.points),
      feedback: data.feedback
    };
  } catch {
    return {
      isCorrect: userAnswer.length > 10,
      score: userAnswer.length > 10 ? Math.round(question.points * 0.7) : 0,
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
    case 'multiple-choice':
      return gradeMultipleChoice(question, userAnswer);
    case 'fill-blank':
      return gradeFillBlank(question, userAnswer);
    case 'open-ended':
      return gradeOpenEnded(question, userAnswer, level);
    default:
      return { isCorrect: false, score: 0, feedback: 'Invalid question type' };
  }
}

export function calculateSkillScores(
  questions: Question[],
  answers: Answer[]
): SkillScores {
  const skillScores: Record<SkillType, { total: number; earned: number }> = {
    listening: { total: 0, earned: 0 },
    reading: { total: 0, earned: 0 },
    speaking: { total: 0, earned: 0 },
    writing: { total: 0, earned: 0 }
  };

  for (const question of questions) {
    const answer = answers.find(a => a.questionId === question.id);
    if (answer) {
      skillScores[question.skill].total += question.points;
      skillScores[question.skill].earned += answer.score || 0;
    }
  }

  return {
    listening: skillScores.listening.total > 0
      ? Math.round((skillScores.listening.earned / skillScores.listening.total) * 100)
      : 0,
    reading: skillScores.reading.total > 0
      ? Math.round((skillScores.reading.earned / skillScores.reading.total) * 100)
      : 0,
    speaking: skillScores.speaking.total > 0
      ? Math.round((skillScores.speaking.earned / skillScores.speaking.total) * 100)
      : 0,
    writing: skillScores.writing.total > 0
      ? Math.round((skillScores.writing.earned / skillScores.writing.total) * 100)
      : 0
  };
}

export function calculateOverallScore(skillScores: SkillScores): number {
  const scores = Object.values(skillScores);
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function determineRecommendedLevel(score: number): CEFRLevel {
  if (score >= 90) return 'C2';
  if (score >= 80) return 'C1';
  if (score >= 70) return 'B2';
  if (score >= 60) return 'B1';
  if (score >= 50) return 'A2';
  return 'A1';
}
