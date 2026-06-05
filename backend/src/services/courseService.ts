import { AppDataSource } from '../config/database';
import { Course } from '../entities/Course';
import { Lesson } from '../entities/Lesson';
import { CourseProgress } from '../entities/CourseProgress';

const courseRepository = AppDataSource.getRepository(Course);
const lessonRepository = AppDataSource.getRepository(Lesson);
const courseProgressRepository = AppDataSource.getRepository(CourseProgress);

export async function getAllCourses(language?: string, difficulty?: string): Promise<Course[]> {
  const queryBuilder = courseRepository
    .createQueryBuilder('course')
    .where('course.is_active = :isActive', { isActive: true });

  if (language) {
    queryBuilder.andWhere('course.language = :language', { language });
  }

  if (difficulty) {
    queryBuilder.andWhere('course.difficulty = :difficulty', { difficulty });
  }

  return queryBuilder.getMany();
}

export async function getCourseById(courseId: string): Promise<Course | null> {
  return courseRepository.findOne({
    where: { id: courseId },
    relations: ['lessons']
  });
}

export async function getMyCourses(userId: string): Promise<CourseProgress[]> {
  return courseProgressRepository.find({
    where: { user_id: userId },
    relations: ['course']
  });
}

export async function getCourseProgress(userId: string, courseId: string): Promise<CourseProgress | null> {
  return courseProgressRepository.findOne({
    where: { user_id: userId, course_id: courseId },
    relations: ['course', 'current_lesson']
  });
}

export async function enrollInCourse(userId: string, courseId: string): Promise<CourseProgress> {
  let progress = await courseProgressRepository.findOne({
    where: { user_id: userId, course_id: courseId }
  });

  if (progress) {
    return progress;
  }

  const course = await courseRepository.findOne({
    where: { id: courseId },
    relations: ['lessons']
  });

  if (!course) {
    throw new Error('Course not found');
  }

  const firstLesson = course.lessons?.sort((a, b) => a.order - b.order)[0];

  progress = courseProgressRepository.create({
    user_id: userId,
    course_id: courseId,
    current_lesson_id: firstLesson?.id,
    completed_lessons: []
  });

  return courseProgressRepository.save(progress);
}

export async function completeLesson(
  userId: string,
  courseId: string,
  lessonId: string
): Promise<CourseProgress> {
  let progress = await courseProgressRepository.findOne({
    where: { user_id: userId, course_id: courseId }
  });

  if (!progress) {
    throw new Error('Course progress not found');
  }

  if (!progress.completed_lessons) {
    progress.completed_lessons = [];
  }

  if (!progress.completed_lessons.includes(lessonId)) {
    progress.completed_lessons.push(lessonId);
  }

  const course = await courseRepository.findOne({
    where: { id: courseId },
    relations: ['lessons']
  });

  if (course && course.lessons) {
    const sortedLessons = course.lessons.sort((a, b) => a.order - b.order);
    const currentIndex = sortedLessons.findIndex(l => l.id === lessonId);

    if (currentIndex >= 0 && currentIndex < sortedLessons.length - 1) {
      progress.current_lesson_id = sortedLessons[currentIndex + 1].id;
    } else if (currentIndex === sortedLessons.length - 1) {
      progress.completed_at = new Date();
      progress.current_lesson_id = null;
    }
  }

  return courseProgressRepository.save(progress);
}
