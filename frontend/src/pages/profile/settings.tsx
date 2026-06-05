import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { authAPI } from '../../lib/api';

interface LinkedAccount {
  provider: string;
  email: string;
  avatar_url?: string;
}

export default function AccountSettings() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Password form state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadAccountInfo();
    }
  }, [user, authLoading]);

  const loadAccountInfo = async () => {
    try {
      const data = await authAPI.getAccountInfo();
      setAccountInfo(data);
      setUsername(data.username);
    } catch (err: any) {
      setError(err.message || 'Failed to load account info');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await authAPI.updateProfile({ username });
      setMessage('Profile updated successfully');
      await loadAccountInfo();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleUnlink = async (provider: string) => {
    if (!confirm(`Are you sure you want to unlink your ${provider} account?`)) {
      return;
    }
    try {
      await authAPI.unlinkOAuth(provider);
      setMessage(`${provider} account unlinked successfully`);
      await loadAccountInfo();
    } catch (err: any) {
      setError(err.message || 'Failed to unlink account');
    }
  };

  const getPasswordStrength = (password: string): { strength: string; color: string; passed: boolean } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;

    if (strength <= 1) return { strength: 'Weak', color: 'text-red-600', passed: false };
    if (strength <= 2) return { strength: 'Medium', color: 'text-yellow-600', passed: false };
    return { strength: 'Strong', color: 'text-green-600', passed: true };
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const strength = getPasswordStrength(newPassword);
    if (!strength.passed) {
      setError('Password must be at least 8 characters with uppercase, lowercase, and numbers');
      return;
    }

    setPasswordLoading(true);
    try {
      await authAPI.setPassword(newPassword);
      setMessage('Password set successfully');
      setShowPasswordForm(false);
      setNewPassword('');
      setConfirmPassword('');
      await loadAccountInfo();
    } catch (err: any) {
      setError(err.message || 'Failed to set password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/profile" className="text-blue-600 hover:underline">
            ← Back to Profile
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-8">Account Settings</h1>

        {message && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Profile</h2>
          <form onSubmit={handleUpdateProfile}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={accountInfo?.email || ''}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100"
                disabled
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Update Profile
            </button>
          </form>
        </div>

        {/* Linked Accounts Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Linked Accounts</h2>
          {accountInfo?.linked_accounts?.length > 0 ? (
            <div className="space-y-4">
              {accountInfo.linked_accounts.map((account: LinkedAccount) => (
                <div key={account.provider} className="flex items-center justify-between p-4 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {account.provider === 'google' ? (
                        <span className="text-lg">G</span>
                      ) : (
                        <span className="text-lg">GH</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{account.provider}</p>
                      <p className="text-sm text-gray-500">{account.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnlink(account.provider)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Unlink
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No linked accounts</p>
          )}
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Password</h2>
          {accountInfo?.has_password ? (
            <p className="text-gray-600">Password is set</p>
          ) : showPasswordForm ? (
            <form onSubmit={handleSetPassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {newPassword && (
                  <p className={`text-sm mt-1 ${getPasswordStrength(newPassword).color}`}>
                    Strength: {getPasswordStrength(newPassword).strength}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {passwordLoading ? 'Setting...' : 'Set Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setNewPassword('');
                    setConfirmPassword('');
                    setError('');
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">You have not set a password yet.</p>
              <button
                onClick={() => setShowPasswordForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Set Password
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}