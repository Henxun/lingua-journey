import Head from 'next/head'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { ArrowIcon } from '@/components/ArrowIcon'
import { Navbar } from '@/components/Navbar'

export default function Home() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  }

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: t('home.features.aiDialog.title'),
      description: t('home.features.aiDialog.description'),
      href: '/ai-teacher',
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: t('home.features.aiTeacher.title'),
      description: t('home.features.aiTeacher.description'),
      href: '/ai-teacher',
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-50"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: t('home.features.scene3d.title'),
      description: t('home.features.scene3d.description'),
      href: '/scenes',
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50"
    }
  ]

  const languages = [
    { name: t('home.languages.english') || 'English', emoji: '🇺🇸' },
    { name: t('home.languages.chinese') || '中文', emoji: '🇨🇳' },
    { name: t('home.languages.japanese') || '日本語', emoji: '🇯🇵' },
    { name: t('home.languages.korean') || '한국어', emoji: '🇰🇷' },
    { name: t('home.languages.spanish') || 'Español', emoji: '🇪🇸' },
    { name: t('home.languages.french') || 'Français', emoji: '🇫🇷' },
    { name: t('home.languages.german') || 'Deutsch', emoji: '🇩🇪' },
    { name: t('home.languages.arabic') || 'العربية', emoji: '🇸🇦' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Head>
        <title>{t('common.appName')} - AI Language Learning</title>
        <meta name="description" content={t('home.footer.description')} />
      </Head>

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div 
          className="text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full text-sm font-semibold text-blue-700 mb-8 shadow-lg border border-blue-100">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {t('home.hero.subtitle')}
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight"
            variants={itemVariants}
          >
            {t('home.hero.titleLine1')}
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {t('home.hero.titleLine2')}
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed"
            variants={itemVariants}
          >
            {t('home.hero.description')}
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20"
            variants={itemVariants}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/courses" 
                className="px-10 py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-2xl shadow-blue-500/40"
              >
                {t('home.hero.startLearning')}
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button className="px-8 py-4 bg-white text-gray-700 rounded-2xl font-bold text-lg border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                {t('home.hero.learnMore')} <ArrowIcon direction="right" color="primary" />
              </button>
            </motion.div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-24"
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <Link key={feature.title} href={feature.href || '/'}>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`${feature.bgColor} rounded-3xl p-8 shadow-xl border border-white/50 backdrop-blur-sm cursor-pointer h-full`}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-lg">{feature.description}</p>
                </motion.div>
              </Link>
            ))}
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-gray-900 mb-4">{t('home.languages.title')}</h2>
              <p className="text-xl text-gray-600">{t('home.languages.subtitle')}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {languages.map((lang, index) => (
                <motion.button
                  key={lang.name}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-7 py-4 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all text-gray-800 font-semibold border border-gray-100"
                >
                  <span className="text-2xl mr-2">{lang.emoji}</span>
                  {lang.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>

      <footer className="bg-gradient-to-br from-slate-900 to-gray-900 text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">LJ</span>
                </div>
                <span className="text-xl font-bold">Lingua Journey</span>
              </div>
              <p className="text-gray-400">{t('home.footer.description')}</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-5 text-gray-200">{t('home.footer.features')}</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">{t('home.footer.aiDialog')}</li>
                <li className="hover:text-white transition-colors cursor-pointer">{t('home.footer.aiTeacher')}</li>
                <li className="hover:text-white transition-colors cursor-pointer">{t('home.footer.assessment')}</li>
                <li className="hover:text-white transition-colors cursor-pointer">{t('home.footer.vocabulary')}</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-5 text-gray-200">{t('home.footer.supportedLanguages')}</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">{t('home.footer.english')}</li>
                <li className="hover:text-white transition-colors cursor-pointer">{t('home.footer.chinese')}</li>
                <li className="hover:text-white transition-colors cursor-pointer">{t('home.footer.japanese')}</li>
                <li className="hover:text-white transition-colors cursor-pointer">{t('home.footer.korean')}</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-5 text-gray-200">{t('home.footer.contactUs')}</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">support@linguajourney.com</li>
                <li className="hover:text-white transition-colors cursor-pointer">{t('home.footer.aboutUs')}</li>
                <li className="hover:text-white transition-colors cursor-pointer">{t('home.footer.privacyPolicy')}</li>
                <li className="hover:text-white transition-colors cursor-pointer">{t('home.footer.termsOfService')}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
            © 2026 Lingua Journey. All rights reserved. Made with ❤️ for language learners worldwide.
          </div>
        </div>
      </footer>
    </div>
  )
}