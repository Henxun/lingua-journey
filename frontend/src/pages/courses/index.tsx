import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { courseAPI } from '../../lib/api';
import { motion } from 'framer-motion';
import { ArrowIcon } from '@/components/ArrowIcon';
import { Navbar } from '@/components/Navbar';

type Course = {
  id: string;
  name: string;
  description?: string;
  language: string;
  difficulty: string;
  thumbnail_url?: string;
  is_active: boolean;
  created_at: string;
};

const languages = [
  { value: '', label: 'All Languages', emoji: '🌍' },
  { value: 'en', label: 'English', emoji: '🇺🇸' },
  { value: 'zh', label: '中文', emoji: '🇨🇳' },
  { value: 'ja', label: '日本語', emoji: '🇯🇵' },
  { value: 'ko', label: '한국어', emoji: '🇰🇷' },
  { value: 'es', label: 'Español', emoji: '🇪🇸' },
  { value: 'fr', label: 'Français', emoji: '🇫🇷' },
  { value: 'de', label: 'Deutsch', emoji: '🇩🇪' },
];

const difficulties = [
  { value: '', label: 'All Levels', color: 'gray' },
  { value: 'beginner', label: 'Beginner 🌱', color: 'green' },
  { value: 'intermediate', label: 'Intermediate 🌿', color: 'yellow' },
  { value: 'advanced', label: 'Advanced 🔥', color: 'red' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

export default function Courses() {
  const { t } = useTranslation();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [languageFilter, setLanguageFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, [languageFilter, difficultyFilter]);

  const fetchCourses = async () => {
    try {
      if (initialLoad) {
        setLoading(true);
      } else {
        setListLoading(true);
      }
      
      const data = await courseAPI.getAllCourses(languageFilter || undefined, difficultyFilter || undefined);
      setCourses(data);
      
      if (initialLoad) {
        setInitialLoad(false);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
      setListLoading(false);
    }
  };

  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return {
          badge: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200',
          gradient: 'from-green-400 to-emerald-500'
        };
      case 'intermediate':
        return {
          badge: 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border-yellow-200',
          gradient: 'from-yellow-400 to-orange-500'
        };
      case 'advanced':
        return {
          badge: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-200',
          gradient: 'from-red-400 to-rose-500'
        };
      default:
        return {
          badge: 'bg-gray-100 text-gray-700 border-gray-200',
          gradient: 'from-gray-400 to-slate-500'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Head>
        <title>{t('courses.pageTitle')}</title>
      </Head>
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full text-sm font-semibold text-blue-700 mb-6 shadow-lg border border-blue-100">
            📚 {t('courses.browse')}
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-4">{t('courses.title')}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('courses.subtitle')}</p>
        </motion.div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-12 border border-white/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">🌐 {t('courses.filter.language')}</label>
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg font-medium"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>{lang.emoji} {lang.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">📊 {t('courses.filter.difficulty')}</label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg font-medium"
              >
                {difficulties.map((diff) => (
                  <option key={diff.value} value={diff.value}>{diff.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 课程列表区域 */}
        <div className="relative min-h-[400px]">
          {/* 加载指示器 */}
          {listLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center z-10 bg-slate-50/50 backdrop-blur-sm rounded-3xl"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
              />
            </motion.div>
          )}

          {courses.length === 0 ? (
            <motion.div 
              initial={initialLoad ? { opacity: 0, scale: 0.9 } : false}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="text-8xl mb-6">📚</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('courses.empty.title')}</h2>
              <p className="text-xl text-gray-600">{t('courses.empty.description')}</p>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial={initialLoad ? "hidden" : false}
              animate="visible"
            >
              {courses.map((course) => {
                const style = getDifficultyStyle(course.difficulty);
                const language = languages.find(l => l.value === course.language);
                
                return (
                  <motion.div
                    key={course.id}
                    variants={itemVariants}
                    whileHover={{ y: -12, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push(`/courses/${course.id}`)}
                    className="bg-white rounded-3xl shadow-2xl overflow-hidden cursor-pointer group border border-gray-100"
                  >
                    <div className={`h-48 bg-gradient-to-br ${style.gradient} flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10" />
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="text-7xl group-hover:scale-110 transition-transform duration-300">📖</div>
                      )}
                    </div>
                    <div className="p-7">
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold border ${style.badge}`}>
                          {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                        </span>
                        <span className="text-lg font-semibold text-gray-600">
                          {language?.emoji} {language?.label || course.language}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {course.name}
                      </h3>
                      {course.description && (
                        <p className="text-gray-600 text-base mb-6 line-clamp-2 leading-relaxed">{course.description}</p>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3.5 px-6 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                      >
                        {t('courses.startLearning')} <ArrowIcon direction="right" color="white" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
