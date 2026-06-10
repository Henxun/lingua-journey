import { AppDataSource } from '../config/database';
import { Assessment, Question, CEFRLevel } from '../entities/Assessment';
import { AssessmentResult } from '../entities/AssessmentResult';
import { UserSkillProfile } from '../entities/UserSkillProfile';
import { generateAssessmentQuestions } from './questionGenerator';

const assessmentRepository = AppDataSource.getRepository(Assessment);
const resultRepository = AppDataSource.getRepository(AssessmentResult);
const skillProfileRepository = AppDataSource.getRepository(UserSkillProfile);

export async function createAssessment(
  name: string,
  level: CEFRLevel,
  skills: string[],
  timeLimit: number = 30,
  passingScore: number = 70
): Promise<Assessment> {
  const questions = await generateAssessmentQuestions(level, skills);

  const assessment = new Assessment();
  assessment.name = name;
  assessment.level = level;
  assessment.skills = skills;
  assessment.time_limit = timeLimit;
  assessment.passing_score = passingScore;
  assessment.questions = questions;

  return await assessmentRepository.save(assessment);
}

export async function getAssessment(assessmentId: string): Promise<Assessment | null> {
  return await assessmentRepository.findOne({
    where: { id: assessmentId }
  });
}

export async function getAvailableAssessments(): Promise<Assessment[]> {
  return await assessmentRepository.find({
    order: { created_at: 'DESC' }
  });
}

export interface Answer {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  score?: number;
  feedback?: string;
}

export type SkillScores = Record<string, number>;

export async function submitAssessment(
  assessmentId: string,
  userId: string,
  answers: Answer[]
): Promise<AssessmentResult> {
  const assessment = await getAssessment(assessmentId);
  if (!assessment) {
    throw new Error('Assessment not found');
  }

  const gradedAnswers: Record<string, string | string[]> = {};
  const skillScoreMap: Record<string, { total: number; correct: number }> = {};

  for (const question of assessment.questions) {
    const userAnswer = answers.find(a => a.questionId === question.id);
    if (userAnswer) {
      gradedAnswers[question.id] = userAnswer.answer;
      
      if (!skillScoreMap[question.skill]) {
        skillScoreMap[question.skill] = { total: 0, correct: 0 };
      }
      skillScoreMap[question.skill].total += 10;
      
      const isCorrect = String(userAnswer.answer).toLowerCase() === String(question.correctAnswer).toLowerCase();
      skillScoreMap[question.skill].correct += isCorrect ? 10 : 0;
    }
  }

  const skillScores: SkillScores = {};
  for (const [skill, scores] of Object.entries(skillScoreMap)) {
    skillScores[skill] = Math.round((scores.correct / scores.total) * 100);
  }

  const overallScore = Object.keys(skillScores).length > 0
    ? Math.round(Object.values(skillScores).reduce((a, b) => a + b, 0) / Object.keys(skillScores).length)
    : 0;

  const result = new AssessmentResult();
  result.user_id = userId;
  result.assessment_id = assessmentId;
  result.score = overallScore;
  result.skill_scores = skillScores;
  result.answers = gradedAnswers;
  result.feedback = {
    overall: generateOverallFeedback(overallScore, skillScores),
    recommendations: generateRecommendations(skillScores).join(' || ')
  };
  result.passed = overallScore >= assessment.passing_score;

  const savedResult = await resultRepository.save(result);
  await updateUserSkillProfiles(userId, skillScores);

  return savedResult;
}

function generateOverallFeedback(score: number, skillScores: SkillScores): string {
  if (score >= 90) return 'Excellent work! You have a strong grasp of the language.';
  if (score >= 80) return 'Great job! Keep practicing to maintain your skills.';
  if (score >= 70) return 'Good progress! Focus on the areas you found challenging.';
  if (score >= 60) return 'You\'re making progress! Keep up the consistent practice.';
  return 'Don\'t give up! Every practice session helps you improve.';
}

function generateRecommendations(skillScores: SkillScores): string[] {
  const recommendations: string[] = [];
  const weakSkills = Object.entries(skillScores)
    .filter(([, score]) => score < 70)
    .sort((a, b) => (a[1] as number) - (b[1] as number));

  for (const [skill] of weakSkills) {
    recommendations.push(`Focus on improving your ${skill} skills.`);
  }

  if (recommendations.length === 0) {
    recommendations.push('Keep up the consistent practice to maintain your level.');
  }

  return recommendations;
}

async function updateUserSkillProfiles(
  userId: string,
  skillScores: SkillScores
): Promise<void> {
  for (const [skill, score] of Object.entries(skillScores)) {
    let profile = await skillProfileRepository.findOne({
      where: { user_id: userId, skill }
    });

    if (!profile) {
      profile = new UserSkillProfile();
      profile.user_id = userId;
      profile.skill = skill;
      profile.level = score >= 80 ? 'advanced' : score >= 60 ? 'intermediate' : 'beginner';
    }

    const prevScore = profile.score;
    profile.score = score;
    profile.last_assessed = new Date();
    profile.practice_count += 1;
    
    if (score >= 60) {
      profile.correct_count += 1;
    }

    if (prevScore > 0) {
      profile.trend = score > prevScore + 5 ? 1 : score < prevScore - 5 ? -1 : 0;
    }

    await skillProfileRepository.save(profile);
  }
}

export async function getUserResults(userId: string): Promise<AssessmentResult[]> {
  return await resultRepository.find({
    where: { user_id: userId },
    order: { completed_at: 'DESC' }
  });
}

export async function getUserSkillProfiles(userId: string): Promise<UserSkillProfile[]> {
  return await skillProfileRepository.find({ where: { user_id: userId } });
}