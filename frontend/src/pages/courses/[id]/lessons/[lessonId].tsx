import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../../contexts/AuthContext';
import { courseAPI } from '../../../../lib/api';

type Lesson = {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order: number;
  type: string;
  scene_id?: string;
  conversation_config?: any;
};

type Course = {
  id: string;
  name: string;
  description?: string;
  language: string;
  difficulty: string;
  thumbnail_url?: string;
  is_active: boolean;
  created_at: string;
  lessons: Lesson[];
};

type CourseProgress = {
  id: string;
  user_id: string;
  course_id: string;
  current_lesson_id?: string;
  completed_lessons: string[];
  started_at: string;
  completed_at?: string;
  updated_at: string;
};

export default function LessonPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { id: courseId, lessonId } = router.query;
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (courseId && lessonId) {
      fetchData();
    }
  }, [courseId, lessonId, user]);

  const fetchData = async () => {
    try {
      const [courseData, progressData] = await Promise.all([
        courseAPI.getCourse(courseId as string),
        user ? courseAPI.getCourseProgress(courseId as string).catch(() => null) : null
      ]);
      setCourse(courseData);
      const foundLesson = courseData.lessons?.find((l: Lesson) => l.id === lessonId);
      setLesson(foundLesson || null);
      setProgress(progressData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (!courseId || !lessonId) return;
    try {
      setCompleting(true);
      await courseAPI.completeLesson(courseId as string, lessonId as string);
      await fetchData();
    } catch (error) {
      console.error('Failed to complete lesson:', error);
    } finally {
      setCompleting(false);
    }
  };

  const isCompleted = progress?.completed_lessons?.includes(lessonId as string);
  const sortedLessons = course?.lessons?.sort((a: Lesson, b: Lesson) => a.order - b.order) || [];
  const currentIndex = sortedLessons.findIndex((l: Lesson) => l.id === lessonId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < sortedLessons.length - 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lesson not found</h1>
          <button
            onClick={() => router.push(`/courses/${courseId}`)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() => router.push(`/courses/${courseId}`)}
                  className="text-white/80 hover:text-white mb-4 inline-flex items-center"
                >
                  ← Back to course
                </button>
                <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>
                {lesson.description && (
                  <p className="text-blue-100 mt-2">{lesson.description}</p>
                )}
              </div>
              <div className="text-white/80 text-sm">
                Lesson {lesson.order} of {sortedLessons.length}
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            {lesson.type === 'conversation' ? (
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">💬</div>
                  <h2 className="text-xl font-semibold text-gray-900">Conversation Practice</h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Practice your conversation skills in this lesson. Start a chat and get feedback!
                </p>
                <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-colors">
                  Start Conversation
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">🎬</div>
                  <h2 className="text-xl font-semibold text-gray-900">Scene Practice</h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Immersive scene practice coming soon!
                </p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div>
                {hasPrevious && (
                  <button
                    onClick={() => router.push(`/courses/${courseId}/lessons/${sortedLessons[currentIndex - 1].id}`)}
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    ← Previous Lesson
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                {!isCompleted && (
                  <button
                    onClick={handleCompleteLesson}
                    disabled={completing}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {completing ? 'Completing...' : 'Mark as Complete'}
                  </button>
                )}
                {isCompleted && (
                  <div className="flex items-center gap-2 text-green-600">
                    <span>✓</span>
                    <span className="font-medium">Completed</span>
                  </div>
                )}
                {hasNext && (
                  <button
                    onClick={() => router.push(`/courses/${courseId}/lessons/${sortedLessons[currentIndex + 1].id}`)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors"
                  >
                    Next Lesson →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
