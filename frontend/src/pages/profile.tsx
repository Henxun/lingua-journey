import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, courseAPI } from '../lib/api';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';

type UserProfile = {
  id: string;
  email: string;
  username: string;
  native_language: string;
  target_language: string;
  level: number;
  avatar_url?: string;
  auth_provider: string;
  email_verified: boolean;
  oauth_profiles?: any;
  has_password?: boolean;
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
  course: {
    id: string;
    name: string;
    description?: string;
    language: string;
    difficulty: string;
    thumbnail_url?: string;
    lessons: any[];
  };
};

const languages = [
  { value: 'zh', label: '中文 (Chinese)' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語 (Japanese)' },
  { value: 'ko', label: '한국어 (Korean)' },
  { value: 'es', label: 'Español (Spanish)' },
  { value: 'fr', label: 'Français (French)' },
  { value: 'de', label: 'Deutsch (German)' },
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

export default function Profile() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    native_language: '',
    target_language: '',
    avatar_url: '',
  });
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [myCourses, setMyCourses] = useState<CourseProgress[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchProfile();
    fetchMyCourses();
  }, [user, router]);

  const fetchProfile = async () => {
    try {
      const data = await authAPI.getProfile();
      setProfile(data);
      setFormData({
        username: data.username,
        native_language: data.native_language,
        target_language: data.target_language,
        avatar_url: data.avatar_url || '',
      });
    } catch (error) {
      setMessage({ text: t('profile.loadError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCourses = async () => {
    try {
      const data = await courseAPI.getMyCourses();
      setMyCourses(data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await authAPI.updateProfile(formData);
      await fetchProfile();
      setEditing(false);
      setMessage({ text: t('profile.updateSuccess'), type: 'success' });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : t('profile.updateError'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await authAPI.changePassword(passwordData.old_password, passwordData.new_password);
      setShowPasswordForm(false);
      setPasswordData({ old_password: '', new_password: '' });
      setMessage({ text: t('profile.passwordChangeSuccess'), type: 'success' });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : t('profile.passwordChangeError'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleUnlinkOAuth = async (provider: string) => {
    if (!confirm(`Are you sure you want to unlink your ${provider} account?`)) return;
    try {
      await authAPI.unlinkOAuth(provider);
      await fetchProfile();
      setMessage({ text: t('profile.unlinkSuccess', { provider }), type: 'success' });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : t('profile.unlinkError'), type: 'error' });
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

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Head>
        <title>{t('profile.pageTitle')}</title>
      </Head>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/60"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-10 py-8">
            <div className="flex items-center gap-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-4xl font-black text-white shadow-xl"
              >
                {profile.username[0].toUpperCase()}
              </motion.div>
              <div>
                <h1 className="text-3xl font-black text-white mb-2">{profile.username}</h1>
                <p className="text-blue-100 text-lg">{profile.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-4 py-1 bg-white/20 backdrop-blur rounded-full text-white font-semibold">
                    Level {profile.level}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-10 py-8">
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-2xl mb-8 ${
                  message.type === 'success' 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200' 
                    : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200'
                } font-semibold text-center`}
              >
                {message.type === 'success' ? '✅ ' : '❌ '}
                {message.text}
              </motion.div>
            )}

            {myCourses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-10"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  {t('profile.myCourses')}
                </h3>
                <div className="grid gap-4">
                  {myCourses.map((progress, index) => {
                    const totalLessons = progress.course.lessons?.length || 0;
                    const completedLessons = progress.completed_lessons?.length || 0;
                    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
                    return (
                      <motion.div
                        key={progress.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + index * 0.05 }}
                        whileHover={{ x: 5, scale: 1.02 }}
                        onClick={() => router.push(`/courses/${progress.course_id}`)}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all border border-blue-100 shadow-md hover:shadow-xl"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-xl font-bold text-gray-900">{progress.course.name}</h4>
                          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {t('profile.complete', { percentage: percentage })}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full shadow-lg"
                          ></motion.div>
                        </div>
                        <p className="text-base text-gray-600 font-medium">
                          {progress.completed_at ? (
                            <span className="text-green-600 flex items-center gap-2">
                              {t('profile.completed')}
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              {t('profile.inProgress')}
                            </span>
                          )}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {!editing ? (
              <motion.div
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-100">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">{t('profile.nativeLanguage')}</label>
                    <p className="text-xl font-bold text-gray-900 mt-2">
                      {languages.find(l => l.value === profile.native_language)?.label || profile.native_language}
                    </p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                    <label className="text-sm font-bold text-blue-600 uppercase tracking-wide">{t('profile.targetLanguage')}</label>
                    <p className="text-xl font-bold text-blue-900 mt-2">
                      {languages.find(l => l.value === profile.target_language)?.label || profile.target_language}
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="p-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-100">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wide">{t('profile.emailStatus')}</label>
                  <p className="text-xl font-bold text-gray-900 mt-2 flex items-center gap-2">
                    {profile.email_verified ? (
                      <span className="text-green-600 flex items-center gap-2">{t('profile.verified')}</span>
                    ) : (
                      <span className="text-orange-600 flex items-center gap-2">{t('profile.notVerified')}</span>
                    )}
                  </p>
                </motion.div>

                {profile.oauth_profiles && Object.keys(profile.oauth_profiles).length > 0 && (
                  <motion.div variants={itemVariants} className="p-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-100">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 block">{t('profile.linkedAccounts')}</label>
                    <div className="space-y-3">
                      {Object.entries(profile.oauth_profiles).map(([provider, data]: [string, any]) => (
                        <div key={provider} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                          <span className="capitalize font-bold text-gray-800">{provider}</span>
                          <button
                            onClick={() => handleUnlinkOAuth(provider)}
                            className="text-red-600 hover:text-red-700 text-sm font-semibold px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            {t('profile.unlink')}
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/profile/stats')}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-xl shadow-green-500/30"
                  >
                    {t('profile.viewStats')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/profile/gamification')}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-indigo-700 transition-all shadow-xl shadow-purple-500/30"
                  >
                    {t('profile.gameCenter')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/profile/learning-path')}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-orange-600 hover:to-red-700 transition-all shadow-xl shadow-orange-500/30"
                  >
                    {t('profile.learningPath')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/vocabulary')}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-pink-600 hover:to-rose-700 transition-all shadow-xl shadow-pink-500/30"
                  >
                    {t('profile.vocabulary')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEditing(true)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-xl shadow-blue-500/30"
                  >
                    {t('profile.editProfile')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={logout}
                    className="px-8 py-4 bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 rounded-2xl font-bold text-lg hover:from-gray-200 hover:to-slate-200 transition-all border border-gray-200 shadow-lg"
                  >
                    {t('profile.logout')}
                  </motion.button>
                </motion.div>

                {profile.auth_provider === 'email' && (
                  <motion.div variants={itemVariants} className="pt-4">
                    {profile.has_password ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        className="text-blue-600 hover:text-blue-700 font-bold text-lg"
                      >
                        {showPasswordForm ? t('profile.cancel') : t('profile.changePassword')}
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push('/profile/settings')}
                        className="text-green-600 hover:text-green-700 font-bold text-lg"
                      >
                        {t('profile.setupPassword')}
                      </motion.button>
                    )}
                  </motion.div>
                )}

                {profile.auth_provider !== 'email' && !profile.has_password && (
                  <motion.div variants={itemVariants} className="pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push('/profile/settings')}
                      className="text-green-600 hover:text-green-700 font-bold text-lg"
                    >
                      {t('profile.setupPassword')}
                    </motion.button>
                  </motion.div>
                )}

                {showPasswordForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    onSubmit={handleChangePassword}
                    className="mt-8 space-y-6 border-t-2 border-gray-100 pt-8"
                  >
                    <div>
                      <label className="block text-base font-bold text-gray-700 mb-3">{t('profile.currentPassword')}</label>
                      <input
                        type="password"
                        value={passwordData.old_password}
                        onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-base font-bold text-gray-700 mb-3">{t('profile.newPassword')}</label>
                      <input
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg font-medium"
                        required
                        minLength={6}
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={saving}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-blue-500/30"
                    >
                      {saving ? t('profile.changing') : t('profile.changePasswordBtn')}
                    </motion.button>
                  </motion.form>
                )}
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSaveProfile}
                className="space-y-6"
              >
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-3">{t('profile.username')}</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg font-medium"
                    required
                    minLength={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-bold text-gray-700 mb-3">{t('profile.nativeLanguage')}</label>
                    <select
                      value={formData.native_language}
                      onChange={(e) => setFormData({ ...formData, native_language: e.target.value })}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg font-medium"
                    >
                      {languages.map((lang) => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-base font-bold text-gray-700 mb-3">{t('profile.targetLanguage')}</label>
                    <select
                      value={formData.target_language}
                      onChange={(e) => setFormData({ ...formData, target_language: e.target.value })}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg font-medium"
                    >
                      {languages.map((lang) => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-blue-500/30"
                  >
                    {saving ? t('profile.saving') : t('profile.saveChanges')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        username: profile.username,
                        native_language: profile.native_language,
                        target_language: profile.target_language,
                        avatar_url: profile.avatar_url || '',
                      });
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 rounded-2xl font-bold text-lg hover:from-gray-200 hover:to-slate-200 transition-all border border-gray-200 shadow-lg"
                  >
                    {t('profile.cancel')}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
