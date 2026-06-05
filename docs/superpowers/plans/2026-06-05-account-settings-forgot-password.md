# 账户设置和忘记密码功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现账户设置页面（OAuth关联/解绑）和忘记密码功能

**Architecture:** 
- 后端：扩展现有 authService 和 emailService，增加密码重置 API
- 前端：创建账户设置、忘记密码、重置密码页面
- 使用 JWT token 认证，验证码存储在数据库

**Tech Stack:** Next.js, React, Express.js, TypeORM, SQLite, nodemailer

---

## 第一阶段：后端密码重置 API

### Task 1: 后端 - 密码重置验证和设置 API

**Files:**
- Modify: `backend/src/services/authService.ts`
- Modify: `backend/src/controllers/authController.ts`
- Modify: `backend/src/routes/authRoutes.ts`

- [ ] **Step 1.1: 添加密码重置服务函数到 authService.ts**

```typescript
// 在 authService.ts 末尾添加：

export async function resetPassword(
  email: string,
  newPassword: string
): Promise<User> {
  const user = await userRepository.findOne({ where: { email } });
  if (!user) {
    throw new Error('User not found');
  }

  // 密码强度验证
  if (newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(newPassword)) {
    throw new Error('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(newPassword)) {
    throw new Error('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(newPassword)) {
    throw new Error('Password must contain at least one number');
  }

  user.password_hash = await bcrypt.hash(newPassword, 10);
  return await userRepository.save(user);
}

export async function invalidateVerificationCodes(email: string): Promise<void> {
  await verificationCodeRepository.update(
    { email },
    { is_used: true }
  );
}
```

- [ ] **Step 1.2: 添加 resetPasswordSchema 验证模式**

```typescript
// 在 authController.ts 中，changePasswordSchema 后添加：

const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  new_password: z.string().min(8)
});
```

- [ ] **Step 1.3: 添加 handleResetPassword 控制器函数**

```typescript
// 在 authController.ts 中，handleChangePassword 后添加：

export async function handleResetPassword(req: Request, res: Response) {
  try {
    const { email, code, new_password } = resetPasswordSchema.parse(req.body);
    
    // 验证验证码
    await verifyCode(email, code, VerificationCodeType.RESET_PASSWORD);
    
    // 重置密码
    await resetPassword(email, new_password);
    
    // 使所有该邮箱的验证码失效
    await invalidateVerificationCodes(email);
    
    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
```

- [ ] **Step 1.4: 添加路由**

```typescript
// 在 authRoutes.ts 中添加：

router.post('/password-reset/reset', handleResetPassword);
```

- [ ] **Step 1.5: 提交代码**

```bash
cd e:/workspace/lingua-journey && git add -A && git commit -m "feat: add password reset API endpoints"
```

---

### Task 2: 后端 - 获取账户信息 API

**Files:**
- Modify: `backend/src/controllers/authController.ts`
- Modify: `backend/src/routes/authRoutes.ts`

- [ ] **Step 2.1: 添加 getAccountInfo 函数到 authController.ts**

```typescript
// 在 handleUnlinkOAuth 后添加：

export async function getAccountInfo(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const user = await getUserProfile(userId);
    
    const linkedAccounts: { provider: string; email: string; avatar_url?: string }[] = [];
    
    if (user.oauth_profiles) {
      if (user.oauth_profiles.google) {
        linkedAccounts.push({
          provider: 'google',
          email: user.oauth_profiles.google.email,
          avatar_url: user.oauth_profiles.google.avatar_url
        });
      }
      if (user.oauth_profiles.github) {
        linkedAccounts.push({
          provider: 'github',
          email: user.oauth_profiles.github.email,
          avatar_url: user.oauth_profiles.github.avatar_url
        });
      }
    }
    
    res.status(200).json({
      id: user.id,
      email: user.email,
      username: user.username,
      native_language: user.native_language,
      target_language: user.target_language,
      level: user.level,
      avatar_url: user.avatar_url,
      has_password: !!user.password_hash,
      linked_accounts: linkedAccounts,
      primary_provider: user.auth_provider
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
```

- [ ] **Step 2.2: 添加路由**

```typescript
// 在 authRoutes.ts 中添加：

router.get('/account', authenticate, getAccountInfo);
```

- [ ] **Step 2.3: 提交代码**

```bash
git add -A && git commit -m "feat: add get account info API"
```

---

## 第二阶段：前端账户设置页面

### Task 3: 前端 - 账户设置页面

**Files:**
- Create: `frontend/src/pages/profile/settings.tsx`
- Modify: `frontend/src/lib/api.ts`

- [ ] **Step 3.1: 在 api.ts 添加账户相关 API 函数**

```typescript
// 在 api.ts 中添加：

export async function getAccountInfo() {
  const data = await fetchAPI('/auth/account');
  return data;
}

export async function updateProfile(data: {
  username?: string;
  native_language?: string;
  target_language?: string;
}) {
  return await fetchAPI('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function unlinkOAuth(provider: string) {
  return await fetchAPI(`/auth/unlink-oauth/${provider}`, {
    method: 'DELETE'
  });
}

export async function linkOAuth(provider: string) {
  const data = await fetchAPI(`/auth/oauth/${provider}/redirect`, {
    method: 'POST'
  });
  return data.auth_url;
}
```

- [ ] **Step 3.2: 创建账户设置页面**

```tsx
// frontend/src/pages/profile/settings.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { getAccountInfo, updateProfile, unlinkOAuth } from '../../lib/api';

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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadAccountInfo();
    }
  }, [user, authLoading]);

  const loadAccountInfo = async () => {
    try {
      const data = await getAccountInfo();
      setAccountInfo(data);
      setUsername(data.username);
    } catch (err) {
      setError('Failed to load account info');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await updateProfile({ username });
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
      await unlinkOAuth(provider);
      setMessage(`${provider} account unlinked successfully`);
      await loadAccountInfo();
    } catch (err: any) {
      setError(err.message || 'Failed to unlink account');
    }
  };

  if (loading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
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
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Email</label>
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
                      {account.provider === 'google' ? 'G' : 'GH'}
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
          ) : (
            <p className="text-gray-600">
              You can set a password by using the{" "}
              <a href="/forgot-password" className="text-blue-600 hover:underline">
                forgot password
              </a>{" "}
              flow.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3.3: 提交代码**

```bash
git add -A && git commit -m "feat: add account settings frontend page"
```

---

## 第三阶段：前端忘记密码页面

### Task 4: 前端 - 忘记密码页面

**Files:**
- Create: `frontend/src/pages/forgot-password.tsx`
- Modify: `frontend/src/lib/api.ts`

- [ ] **Step 4.1: 在 api.ts 添加忘记密码 API 函数**

```typescript
// 在 api.ts 中添加：

export async function requestPasswordReset(email: string) {
  return await fetchAPI('/auth/email/send-code', {
    method: 'POST',
    body: JSON.stringify({ email, type: 'reset_password' })
  });
}
```

- [ ] **Step 4.2: 创建忘记密码页面**

```tsx
// frontend/src/pages/forgot-password.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { requestPasswordReset } from '../lib/api';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setMessage('If an account exists with this email, a verification code has been sent');
      // 跳转到重置密码页面，同时传递 email
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 py-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-8">Reset Password</h1>
        
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

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4.3: 提交代码**

```bash
git add -A && git commit -m "feat: add forgot password frontend page"
```

---

### Task 5: 前端 - 重置密码页面

**Files:**
- Create: `frontend/src/pages/reset-password.tsx`
- Modify: `frontend/src/lib/api.ts`

- [ ] **Step 5.1: 在 api.ts 添加重置密码 API 函数**

```typescript
// 在 api.ts 中添加：

export async function resetPassword(email: string, code: string, newPassword: string) {
  return await fetchAPI('/auth/password-reset/reset', {
    method: 'POST',
    body: JSON.stringify({ email, code, new_password: newPassword })
  });
}
```

- [ ] **Step 5.2: 创建重置密码页面**

```tsx
// frontend/src/pages/reset-password.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { resetPassword } from '../lib/api';

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (router.isReady && router.query.email) {
      setEmail(router.query.email as string);
    }
  }, [router.isReady, router.query]);

  const getPasswordStrength = (password: string): { strength: string; color: string } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    
    if (strength <= 1) return { strength: 'Weak', color: 'text-red-600' };
    if (strength <= 2) return { strength: 'Medium', color: 'text-yellow-600' };
    return { strength: 'Strong', color: 'text-green-600' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, code, newPassword);
      setMessage('Password has been reset successfully');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 py-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-8">Set New Password</h1>

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

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="6-digit code"
              maxLength={6}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
            {newPassword && (
              <p className={`text-sm mt-1 ${passwordStrength.color}`}>
                Strength: {passwordStrength.strength}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5.3: 提交代码**

```bash
git add -A && git commit -m "feat: add reset password frontend page"
```

---

## 第四阶段：构建和测试

### Task 6: 构建和测试

- [ ] **Step 6.1: 构建后端**

```bash
cd e:/workspace/lingua-journey/backend && npm run build
```

- [ ] **Step 6.2: 构建前端**

```bash
cd e:/workspace/lingua-journey/frontend && npm run build
```

- [ ] **Step 6.3: 提交代码**

```bash
git add -A && git commit -m "chore: verify build passes"
```

---

## 依赖关系

- Task 1, 2 (后端) 必须先完成
- Task 3, 4, 5 (前端) 依赖 Task 1, 2 完成
- Task 6 (测试) 依赖所有前面任务完成

## 完成总结

实现功能：
- [ ] 密码重置 API（request, verify, set new password）
- [ ] 获取账户信息 API
- [ ] 账户设置页面（查看/更新个人资料）
- [ ] 账户设置页面（查看/解绑 OAuth 账户）
- [ ] 忘记密码页面
- [ ] 重置密码页面
