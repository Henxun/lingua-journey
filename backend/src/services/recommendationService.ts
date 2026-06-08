import { AppDataSource } from '../config/database';
import { RecommendedCourse } from '../entities/RecommendedCourse';
import { Course, Difficulty } from '../entities/Course';
import { CourseProgress } from '../entities/CourseProgress';

const recommendedCourseRepository = AppDataSource.getRepository(RecommendedCourse);
const courseRepository = AppDataSource.getRepository(Course);
const progressRepository = AppDataSource.getRepository(CourseProgress);

const RECOMMENDATION_WEIGHTS = {
  language_match: 0.30,
  level_match: 0.25,
  prerequisite_completion: 0.20,
  popularity: 0.15,
  user_preference: 0.10
};

export interface RecommendationResult {
  course: Course;
  score: number;
  reason: string;
}

export async function getRecommendations(userId: string, limit: number = 10): Promise<RecommendationResult[]> {
  const user = await AppDataSource.getRepository('User').findOne({ where: { id: userId } });
  if (!user) return [];

  const targetLanguage = user.target_language;
  const nativeLanguage = user.native_language;

  const allCourses = await courseRepository.find({
    where: { is_active: true }
  });

  const completedProgress = await progressRepository.find({
    where: { user_id: userId }
  });

  const completedCourseIds = new Set(
    completedProgress
      .filter(p => p.completed_at !== null)
      .map(p => p.course_id)
  );

  const completedCourses = completedProgress
    .filter(p => p.completed_at !== null)
    .map(p => {
      const course = allCourses.find(c => c.id === p.course_id);
      return course;
    })
    .filter(Boolean);

  const userLevel = calculateUserLevel(completedCourses);

  const scoredCourses: RecommendationResult[] = [];

  for (const course of allCourses) {
    if (completedCourseIds.has(course.id)) continue;

    let score = 0;
    let reason = '';

    if (course.language === targetLanguage) {
      score += RECOMMENDATION_WEIGHTS.language_match * 100;
      if (!reason) reason = `Matches your target language`;
    }

    const levelMatch = getLevelMatchScore(userLevel, course.difficulty);
    score += RECOMMENDATION_WEIGHTS.level_match * levelMatch;
    if (levelMatch > 0.7 && !reason) {
      reason = `Matches your current level`;
    }

    const prereqScore = checkPrerequisites(course, completedCourseIds, allCourses);
    score += RECOMMENDATION_WEIGHTS.prerequisite_completion * prereqScore;

    score += course.recommendation_weight * RECOMMENDATION_WEIGHTS.popularity;

    scoredCourses.push({
      course,
      score,
      reason: reason || 'Recommended for you'
    });
  }

  scoredCourses.sort((a, b) => b.score - a.score);

  await saveRecommendations(userId, scoredCourses.slice(0, limit));

  return scoredCourses.slice(0, limit);
}

function calculateUserLevel(completedCourses: Course[]): number {
  if (completedCourses.length === 0) return 0;

  const difficultyScores: Record<Difficulty, number> = {
    [Difficulty.BEGINNER]: 1,
    [Difficulty.INTERMEDIATE]: 2,
    [Difficulty.ADVANCED]: 3
  };

  const totalScore = completedCourses.reduce((sum, course) => {
    return sum + (difficultyScores[course.difficulty] || 1);
  }, 0);

  return Math.round(totalScore / completedCourses.length);
}

function getLevelMatchScore(userLevel: number, courseDifficulty: Difficulty): number {
  const difficultyScores: Record<Difficulty, number> = {
    [Difficulty.BEGINNER]: 1,
    [Difficulty.INTERMEDIATE]: 2,
    [Difficulty.ADVANCED]: 3
  };

  const courseLevel = difficultyScores[courseDifficulty];

  if (userLevel === 0) return courseDifficulty === Difficulty.BEGINNER ? 1 : 0.5;
  if (courseLevel === userLevel) return 1;
  if (Math.abs(courseLevel - userLevel) === 1) return 0.7;
  return 0.3;
}

function checkPrerequisites(course: Course, completedCourseIds: Set<string>, allCourses: Course[]): number {
  return 1;
}

async function saveRecommendations(userId: string, recommendations: RecommendationResult[]): Promise<void> {
  await recommendedCourseRepository.delete({ user_id: userId });

  for (const rec of recommendations) {
    const recommended = new RecommendedCourse();
    recommended.user_id = userId;
    recommended.course_id = rec.course.id;
    recommended.score = rec.score;
    recommended.reason = rec.reason;
    await recommendedCourseRepository.save(recommended);
  }
}

export async function getNextCourse(userId: string): Promise<Course | null> {
  const recommendations = await getRecommendations(userId, 1);
  if (recommendations.length === 0) return null;
  return recommendations[0].course;
}

export async function recordCourseSkipped(userId: string, courseId: string): Promise<void> {
  const existing = await recommendedCourseRepository.findOne({
    where: { user_id: userId, course_id: courseId }
  });

  if (existing) {
    existing.user_skipped = true;
    existing.score = existing.score * 0.5;
    await recommendedCourseRepository.save(existing);
  }
}

export async function recordCourseCompleted(userId: string, courseId: string): Promise<void> {
  const existing = await recommendedCourseRepository.findOne({
    where: { user_id: userId, course_id: courseId }
  });

  if (existing) {
    existing.user_completed = true;
    await recommendedCourseRepository.save(existing);
  }
}

export async function getRecommendedCourses(userId: string): Promise<RecommendedCourse[]> {
  return await recommendedCourseRepository.find({
    where: { user_id: userId, user_completed: false, user_skipped: false },
    relations: ['course'],
    order: { score: 'DESC' },
    take: 20
  });
}
