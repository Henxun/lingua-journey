import { AppDataSource } from '../config/database';
import { LearningPath, PathStatus } from '../entities/LearningPath';
import { LearningGoal } from '../entities/LearningGoal';
import { Course } from '../entities/Course';
import { CourseProgress } from '../entities/CourseProgress';

const pathRepository = AppDataSource.getRepository(LearningPath);
const courseRepository = AppDataSource.getRepository(Course);
const progressRepository = AppDataSource.getRepository(CourseProgress);

export async function generatePath(userId: string, goalId?: string): Promise<LearningPath | null> {
  const user = await AppDataSource.getRepository('User').findOne({ where: { id: userId } });
  if (!user) return null;

  const targetLanguage = user.target_language;

  const courses = await courseRepository.find({
    where: { language: targetLanguage, is_active: true },
    order: { difficulty: 'ASC', created_at: 'ASC' }
  });

  const completedProgress = await progressRepository.find({
    where: { user_id: userId },
    relations: ['course']
  });

  const completedCourseIds = new Set(
    completedProgress
      .filter(p => p.completed_at !== null)
      .map(p => p.course_id)
  );

  const recommendedOrder: string[] = [];
  for (const course of courses) {
    if (!completedCourseIds.has(course.id)) {
      recommendedOrder.push(course.id);
    }
  }

  for (const course of courses) {
    if (completedCourseIds.has(course.id) && !recommendedOrder.includes(course.id)) {
      recommendedOrder.push(course.id);
    }
  }

  let existingPath = await pathRepository.findOne({
    where: { user_id: userId, status: PathStatus.ACTIVE }
  });

  if (existingPath) {
    existingPath.goal_id = goalId || null as any;
    existingPath.course_order = recommendedOrder;
    existingPath.current_position = 0;
    existingPath.status = PathStatus.ACTIVE;
    return await pathRepository.save(existingPath);
  }

  const newPath = new LearningPath();
  newPath.user_id = userId;
  newPath.goal_id = goalId || null as any;
  newPath.course_order = recommendedOrder;
  newPath.current_position = 0;
  newPath.status = PathStatus.ACTIVE;

  return await pathRepository.save(newPath);
}

export async function getUserPath(userId: string): Promise<LearningPath | null> {
  return await pathRepository.findOne({
    where: { user_id: userId, status: PathStatus.ACTIVE },
    relations: ['goal']
  });
}

export async function getUserPathWithCourses(userId: string): Promise<any | null> {
  const path = await getUserPath(userId);
  if (!path) return null;

  const courseIds = path.course_order;
  const courses = await courseRepository.findByIds(courseIds);

  const completedProgress = await progressRepository.find({
    where: { user_id: userId }
  });

  const completedSet = new Set(
    completedProgress
      .filter(p => p.completed_at !== null)
      .map(p => p.course_id)
  );

  const courseMap = new Map(courses.map(c => [c.id, c]));

  const orderedCourses = courseIds
    .map(id => courseMap.get(id))
    .filter(Boolean)
    .map(course => ({
      ...course,
      completed: completedSet.has(course!.id)
    }));

  const completedCount = orderedCourses.filter((c: any) => c.completed).length;

  return {
    ...path,
    courses: orderedCourses,
    completed_count: completedCount,
    total_count: orderedCourses.length,
    progress_percentage: orderedCourses.length > 0
      ? Math.round((completedCount / orderedCourses.length) * 100)
      : 0
  };
}

export async function updatePathProgress(userId: string, position: number): Promise<LearningPath | null> {
  const path = await getUserPath(userId);
  if (!path) return null;

  path.current_position = Math.min(position, path.course_order.length - 1);

  if (position >= path.course_order.length) {
    path.status = PathStatus.COMPLETED;
  }

  return await pathRepository.save(path);
}

export async function advancePathPosition(userId: string): Promise<LearningPath | null> {
  const path = await getUserPath(userId);
  if (!path) return null;

  path.current_position = Math.min(path.current_position + 1, path.course_order.length - 1);

  if (path.current_position >= path.course_order.length - 1) {
    path.status = PathStatus.COMPLETED;
  }

  return await pathRepository.save(path);
}

export async function skipCourseInPath(userId: string, courseId: string): Promise<LearningPath | null> {
  const path = await getUserPath(userId);
  if (!path) return null;

  const courseIndex = path.course_order.indexOf(courseId);
  if (courseIndex === -1 || courseIndex < path.current_position) {
    return path;
  }

  path.course_order = path.course_order.filter(id => id !== courseId);

  if (courseIndex === path.current_position) {
    path.current_position = Math.min(path.current_position, path.course_order.length - 1);
  }

  return await pathRepository.save(path);
}

export async function addCourseToPath(userId: string, courseId: string, position?: number): Promise<LearningPath | null> {
  const path = await getUserPath(userId);
  if (!path) return null;

  if (path.course_order.includes(courseId)) {
    return path;
  }

  if (position !== undefined && position >= 0 && position <= path.course_order.length) {
    path.course_order.splice(position, 0, courseId);
  } else {
    path.course_order.push(courseId);
  }

  return await pathRepository.save(path);
}
