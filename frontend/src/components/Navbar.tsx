import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Navbar = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <nav className="bg-white/70 backdrop-blur-xl shadow-sm border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center space-x-3">
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <span className="text-white font-bold text-xl">LJ</span>
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Lingua Journey
            </span>
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/courses" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              {t('nav.courses')}
            </Link>
            <Link href="/scenes" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              {t('nav.scenes')}
            </Link>
            <Link href="/vocabulary" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              {t('nav.vocabulary')}
            </Link>
            <Link href="/progress" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              {t('nav.progress')}
            </Link>
            {user ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/profile"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
                >
                  {user.username}
                </Link>
              </motion.div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-gray-700 font-medium hover:text-blue-600 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/register"
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
                  >
                    {t('nav.register')}
                  </Link>
                </motion.div>
              </div>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};
