import Head from 'next/head'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>多语种AI在线教育平台 - Lingua Journey</title>
        <meta name="description" content="沉浸式多语种学习平台，通过AI对话练习提升语言能力" />
      </Head>

      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">LJ</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Lingua Journey
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-blue-600 transition-colors">功能</button>
              <button className="text-gray-600 hover:text-blue-600 transition-colors">课程</button>
              <button className="text-gray-600 hover:text-blue-600 transition-colors">社区</button>
              {user ? (
                <>
                  <Link href="/profile" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors">
                    {user.username}
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors">
                    登录
                  </Link>
                  <Link href="/register" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity">
                    注册
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            AI驱动的沉浸式语言学习体验
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            在真实场景中
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> 学习语言</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            通过AI模拟真实对话场景，沉浸式学习多语种。从日常对话到商务场景，让语言学习变得更加生动有趣。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-blue-500/30">
              开始学习
            </button>
            <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-lg hover:border-blue-500 hover:text-blue-600 transition-colors">
              了解更多
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI对话练习</h3>
              <p className="text-gray-600">真实场景模拟对话，智能纠错反馈</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI老师教学</h3>
              <p className="text-gray-600">个性化课程推荐，知识点讲解答疑</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3D场景互动</h3>
              <p className="text-gray-600">沉浸式3D场景，可交互学习体验</p>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">支持多语种学习</h2>
            <p className="text-gray-600">从全球主流语言到小众语种，满足你的学习需求</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {['英语', '汉语', '日语', '韩语', '西班牙语', '法语', '德语', '阿拉伯语'].map((lang) => (
              <button
                key={lang}
                className="px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 text-gray-700 font-medium"
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">LJ</span>
                </div>
                <span className="font-semibold">Lingua Journey</span>
              </div>
              <p className="text-gray-400 text-sm">沉浸式多语种AI在线教育平台</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">功能</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>AI对话练习</li>
                <li>AI老师教学</li>
                <li>语言测评</li>
                <li>词汇记忆</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">支持语言</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>英语</li>
                <li>汉语</li>
                <li>日语</li>
                <li>韩语</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">联系我们</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>support@linguajourney.com</li>
                <li>关于我们</li>
                <li>隐私政策</li>
                <li>服务条款</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2026 Lingua Journey. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}