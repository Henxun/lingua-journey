import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

export default function OAuthCallback() {
  const router = useRouter();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      if (!router.isReady) return;

      const { token, user: userParam, error: errorParam } = router.query;

      // Handle error from OAuth flow
      if (errorParam) {
        setStatus('error');
        setError(decodeURIComponent(errorParam as string));
        return;
      }

      // Handle success token and user data
      if (token && typeof token === 'string' && userParam && typeof userParam === 'string') {
        try {
          // Get user data from URL params
          const userData = decodeURIComponent(userParam);
          const user = JSON.parse(userData);
          
          // Login user
          login(token, user);
          setStatus('success');
          
          // Redirect to home page after a short delay
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } catch (err) {
          setStatus('error');
          setError(err instanceof Error ? err.message : 'Failed to complete authentication');
        }
        return;
      }

      // No token or user data, redirect to login
      setStatus('error');
      setError('Invalid callback parameters - missing token or user data');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    };

    handleCallback();
  }, [router.isReady, router.query, login, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Lingua Journey</h1>
        </div>
        
        <div className="px-8 py-8 text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
              <p className="text-gray-600">Completing authentication...</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">登录成功!</h2>
              <p className="text-gray-600">正在跳转...</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">认证失败</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-red-800 mb-2">
                  <strong>错误详情：</strong>
                </p>
                <p className="text-xs text-red-600 font-mono break-all">{error}</p>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-8 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors"
              >
                返回登录
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
