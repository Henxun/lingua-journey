import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../lib/api';

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

const languages = [
  { value: 'zh', label: '中文 (Chinese)' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語 (Japanese)' },
  { value: 'ko', label: '한국어 (Korean)' },
  { value: 'es', label: 'Español (Spanish)' },
  { value: 'fr', label: 'Français (French)' },
  { value: 'de', label: 'Deutsch (German)' },
];

export default function Profile() {
  const router = useRouter();
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

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchProfile();
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
      setMessage({ text: 'Failed to load profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await authAPI.updateProfile(formData);
      await fetchProfile();
      setEditing(false);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Failed to update profile', type: 'error' });
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
      setMessage({ text: 'Password changed successfully!', type: 'success' });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Failed to change password', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleUnlinkOAuth = async (provider: string) => {
    if (!confirm(`Are you sure you want to unlink your ${provider} account?`)) return;
    try {
      await authAPI.unlinkOAuth(provider);
      await fetchProfile();
      setMessage({ text: `${provider} account unlinked successfully!`, type: 'success' });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Failed to unlink account', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
              <button
                onClick={() => router.push('/')}
                className="text-white/80 hover:text-white"
              >
                ← Back
              </button>
            </div>
          </div>
          
          <div className="px-8 py-6">
            {message && (
              <div className={`p-4 rounded-lg mb-6 ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-2xl font-bold text-white">
                {profile.username[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{profile.username}</h2>
                <p className="text-gray-600">{profile.email}</p>
                <p className="text-sm text-gray-500">Level {profile.level}</p>
              </div>
            </div>

            {!editing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="text-sm font-medium text-gray-500">Native Language</label>
                    <p className="text-gray-900 mt-1">
                      {languages.find(l => l.value === profile.native_language)?.label || profile.native_language}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="text-sm font-medium text-gray-500">Target Language</label>
                    <p className="text-gray-900 mt-1">
                      {languages.find(l => l.value === profile.target_language)?.label || profile.target_language}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="text-sm font-medium text-gray-500">Email Verified</label>
                  <p className="text-gray-900 mt-1 flex items-center gap-2">
                    {profile.email_verified ? (
                      <span className="text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-orange-600">✗ Not Verified</span>
                    )}
                  </p>
                </div>

                {profile.oauth_profiles && Object.keys(profile.oauth_profiles).length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="text-sm font-medium text-gray-500 mb-3 block">Linked Accounts</label>
                    <div className="space-y-2">
                      {Object.entries(profile.oauth_profiles).map(([provider, data]: [string, any]) => (
                        <div key={provider} className="flex items-center justify-between p-2 bg-white rounded-lg">
                          <span className="capitalize">{provider}</span>
                          <button
                            onClick={() => handleUnlinkOAuth(provider)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Unlink
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => router.push('/profile/stats')}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-colors"
                  >
                    View Learning Stats
                  </button>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={logout}
                    className="px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>

                {profile.auth_provider === 'email' && (
                  <>
                    {profile.has_password ? (
                      <button
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {showPasswordForm ? 'Cancel' : 'Change Password'}
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push('/profile/settings')}
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        Set up password →
                      </button>
                    )}
                  </>
                )}

                {profile.auth_provider !== 'email' && !profile.has_password && (
                  <button
                    onClick={() => router.push('/profile/settings')}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Set up password →
                  </button>
                )}

                {showPasswordForm && (
                  <form onSubmit={handleChangePassword} className="mt-6 space-y-4 border-t pt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.old_password}
                        onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        minLength={6}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Changing...' : 'Change Password'}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    minLength={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Native Language</label>
                    <select
                      value={formData.native_language}
                      onChange={(e) => setFormData({ ...formData, native_language: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {languages.map((lang) => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Language</label>
                    <select
                      value={formData.target_language}
                      onChange={(e) => setFormData({ ...formData, target_language: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {languages.map((lang) => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
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
                    className="px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
