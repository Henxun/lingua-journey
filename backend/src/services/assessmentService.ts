import { AppDataSource } from '../config/database';
import { Assessment, Question, CEFRLevel, SkillType } from '../entities/Assessment';
import { AssessmentResult, Answer, SkillScores } from '../entities/AssessmentResult';
import { UserSkillProfile } from '../entities/UserSkillProfile';
import { generateAssessmentQuestions } from './questionGenerator';
import {
  gradeAnswer,
  calculateSkillScores,
  calculateOverallScore,
  determineRecommendedLevel
} from './gradingService';

const assessmentRepository = AppDataSource.getRepository(Assessment);
const resultRepository = AppDataSource.getRepository(AssessmentResult);
const skillProfileRepository = AppDataSource.getRepository(UserSkillProfile);

export async function createAssessment(
  name: string,
  level: CEFRLevel,
  skills: SkillType[],
  timeLimit: number = 30,
  passingScore: number = 70
): Promise<Assessment> {
  const questions = await generateAssessmentQuestions(level, skills);

  const assessment = new Assessment();
  assessment.name = name;
  assessment.level = level;
  assessment.skills = skills;
  assessment.timeLimit = timeLimit;
  assessment.passingScore = passingScore;
  assessment.questions = questions;
  assessment.isActive = true;

  return await assessmentRepository.save(assessment);
}

export async function getAssessment(assessmentId: string): Promise<Assessment | null> {
  return await assessmentRepository.findOne({
    where: { id: assessmentId, isActive: true }
  });
}

export async function getAvailableAssessments(): Promise<Assessment[]> {
  return await assessmentRepository.find({
    where: { isActive: true },
    order: { createdAt: 'DESC' }
  });
}

export async function submitAssessment(
  assessmentId: string,
  userId: string,
  answers: Answer[]
): Promise<AssessmentResult> {
  const assessment = await getAssessment(assessmentId);
  if (!assessment) {
    throw new Error('Assessment not found');
  }

  const gradedAnswers: Answer[] = [];

  for (const question of assessment.questions) {
    const userAnswer = answers.find(a => a.questionId === question.id);
    if (userAnswer) {
      const gradingResult = await gradeAnswer(
        question,
        userAnswer.answer,
        assessment.level
      );
      gradedAnswers.push({
        ...userAnswer,
        isCorrect: gradingResult.isCorrect,
        score: gradingResult.score,
        feedback: gradingResult.feedback
      });
    }
  }

  const skillScores = calculateSkillScores(assessment.questions, gradedAnswers);
  const overallScore = calculateOverallScore(skillScores);
  const recommendedLevel = determineRecommendedLevel(overallScore);

  const result = new AssessmentResult();
  result.userId = userId;
  result.assessmentId = assessmentId;
  result.score = overallScore;
  result.skillScores = skillScores;
  result.answers = gradedAnswers;
  result.recommendedLevel = recommendedLevel;
  result.feedback = generateOverallFeedback(overallScore, skillScores);
  result.recommendations = generateRecommendations(skillScores);
  result.completedAt = new Date();

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
    .filter(([_, score]) => score < 70)
    .sort((a, b) => a[1] - b[1]);

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
      where: { userId, skill: skill as SkillType }
    });

    if (!profile) {
      profile = new UserSkillProfile();
      profile.userId = userId;
      profile.skill = skill as SkillType;
      profile.historicalScores = [];
    }

    const now = new Date();
    profile.historicalScores.push({ date: now, score });
    profile.score = score;
    profile.lastAssessed = now;

    if (profile.historicalScores.length >= 3) {
      const last3 = profile.historicalScores.slice(-3);
      const avgPrev = (last3[0].score + last3[1].score) / 2;
      if (score > avgPrev + 5) profile.trend = 'improving';
      else if (score < avgPrev - 5) profile.trend = 'declining';
      else profile.trend = 'stable';
    }

    await skillProfileRepository.save(profile);
  }
}

export async function getUserResults(userId: string): Promise<AssessmentResult[]> {
  return await resultRepository.find({
    where: { userId },
    order: { createdAt: 'DESC' }
  });
}

export async function getUserSkillProfiles(userId: string): Promise<UserSkillProfile[]> {
  return await skillProfileRepository.find({ where: { userId } });
}
