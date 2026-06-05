import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { courseAPI } from '../../lib/api';

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
  lessons?: Lesson[];
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

const languages = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
];

export default function CourseDetail() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourse();
      if (user) {
        fetchProgress();
      }
    }
  }, [id, user]);

  const fetchCourse = async () => {
    try {
      const data = await courseAPI.getCourse(id as string);
      setCourse(data);
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const data = await courseAPI.getCourseProgress(id as string);
      setProgress(data);
    } catch (error) {
      setProgress(null);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await courseAPI.enrollCourse(id as string);
      await fetchProgress();
    } catch (error) {
      console.error('Failed to enroll:', error);
    } finally {
      setEnrolling(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'conversation':
        return '💬';
      case 'scene':
        return '🎬';
      default:
        return '📖';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h1>
          <button
            onClick={() => router.push('/courses')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to courses
          </button>
        </div>
      </div>
    );
  }

  const sortedLessons = course.lessons?.sort((a, b) => a.order - b.order) || [];
  const completionPercentage = progress ? Math.round((progress.completed_lessons?.length || 0) / sortedLessons.length * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push('/courses')}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back to courses
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
            {course.thumbnail_url ? (
              <img src={course.thumbnail_url} alt={course.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-8xl">📖</div>
            )}
          </div>
          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-4 py-1 rounded-full text-sm font-medium ${getDifficultyColor(course.difficulty)}`}>
                {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
              </span>
              <span className="text-sm text-gray-500">{languages.find(l => l.value === course.language)?.label || course.language}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.name}</h1>
            {course.description && (
              <p className="text-gray-600 mb-6">{course.description}</p>
            )}

            {progress ? (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-900">Your Progress</span>
                  <span className="text-2xl font-bold text-green-600">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
                {progress.current_lesson_id && (
                  <button
                    onClick={() => {
                      const lesson = sortedLessons.find(l => l.id === progress.current_lesson_id);
                      if (lesson) {
                        router.push(`/courses/${id}/lessons/${lesson.id}`);
                      }
                    }}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-colors"
                  >
                    Continue Learning →
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50"
              >
                {enrolling ? 'Enrolling...' : 'Start Learning'}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
          {sortedLessons.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No lessons available yet</p>
          ) : (
            <div className="space-y-4">
              {sortedLessons.map((lesson, index) => {
                const isCompleted = progress?.completed_lessons?.includes(lesson.id);
                const isCurrent = progress?.current_lesson_id === lesson.id;
                const isUnlocked = progress && (isCompleted || index === 0 || sortedLessons.slice(0, index).some(l => progress.completed_lessons?.includes(l.id)));

                return (
                  <div
                    key={lesson.id}
                    onClick={() => {
                      if (isUnlocked) {
                        router.push(`/courses/${id}/lessons/${lesson.id}`);
                      }
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isCurrent
                        ? 'border-blue-500 bg-blue-50'
                        : isCompleted
                        ? 'border-green-500 bg-green-50'
                        : isUnlocked
                        ? 'border-gray-200 hover:border-blue-300 cursor-pointer'
                        : 'border-gray-100 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl shadow-sm">
                          {isCompleted ? '✓' : getLessonIcon(lesson.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Lesson {lesson.order}</span>
                            {isCurrent && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Current</span>}
                            {isCompleted && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Completed</span>}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">{lesson.title}</h3>
                          {lesson.description && (
                            <p className="text-gray-600 text-sm mt-1">{lesson.description}</p>
                          )}
                        </div>
                      </div>
                      {isUnlocked && (
                        <div className="text-blue-600">→</div>
                      )}
                      {!isUnlocked && progress && (
                        <div className="text-gray-400">🔒</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
