import { Request, Response } from 'express';
import { 
  registerUser, 
  loginUser, 
  registerOrLoginWithCode, 
  getUserProfile, 
  updateUserProfile, 
  changePassword,
  setPassword,
  generateToken,
  resetPassword,
  invalidateVerificationCodes
} from '../services/authService';
import { sendVerificationCode, verifyCode } from '../services/emailService';
import { findOrCreateOAuthUser, linkOAuthAccount, unlinkOAuthAccount, OAuthUserInfo } from '../services/oauthService';
import { VerificationCodeType } from '../entities/VerificationCode';
import { AuthProvider } from '../entities/User';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  native_language: z.string(),
  target_language: z.string()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const sendCodeSchema = z.object({
  email: z.string().email(),
  type: z.enum(['register', 'login', 'reset_password'])
});

const verifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  type: z.enum(['register', 'login', 'reset_password']),
  username: z.string().min(3).max(50).optional(),
  native_language: z.string().optional(),
  target_language: z.string().optional()
});

const updateProfileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  native_language: z.string().optional(),
  target_language: z.string().optional(),
  avatar_url: z.string().url().optional()
});

const changePasswordSchema = z.object({
  old_password: z.string().min(6),
  new_password: z.string().min(6)
});

const setPasswordSchema = z.object({
  new_password: z.string().min(8)
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  new_password: z.string().min(8)
});

export async function register(req: Request, res: Response) {
  try {
    const { email, username, password, native_language, target_language } = registerSchema.parse(req.body);
    const user = await registerUser({ email, username, password, native_language, target_language });
    
    res.status(201).json({
      id: user.id,
      email: user.email,
      username: user.username,
      native_language: user.native_language,
      target_language: user.target_language,
      level: user.level,
      created_at: user.created_at
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const { user, token } = await loginUser(email, password);
    
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        level: user.level
      },
      token
    });
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
}

export async function sendEmailCode(req: Request, res: Response) {
  try {
    const { email, type } = sendCodeSchema.parse(req.body);
    await sendVerificationCode(email, type as VerificationCodeType);
    res.status(200).json({ message: 'Verification code sent successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function verifyEmailCode(req: Request, res: Response) {
  try {
    const { email, code, type, username, native_language, target_language } = verifyCodeSchema.parse(req.body);
    await verifyCode(email, code, type as VerificationCodeType);
    
    const { user, token } = await registerOrLoginWithCode(email, {
      username,
      native_language,
      target_language
    });
    
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        level: user.level
      },
      token
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const user = await getUserProfile(userId);
    res.status(200).json({
      id: user.id,
      email: user.email,
      username: user.username,
      native_language: user.native_language,
      target_language: user.target_language,
      level: user.level,
      avatar_url: user.avatar_url,
      auth_provider: user.auth_provider,
      email_verified: user.email_verified,
      oauth_profiles: user.oauth_profiles,
      has_password: !!user.password_hash
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const data = updateProfileSchema.parse(req.body);
    const user = await updateUserProfile(userId, data);
    
    res.status(200).json({
      id: user.id,
      email: user.email,
      username: user.username,
      native_language: user.native_language,
      target_language: user.target_language,
      level: user.level,
      avatar_url: user.avatar_url
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function handleChangePassword(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { old_password, new_password } = changePasswordSchema.parse(req.body);
    await changePassword(userId, old_password, new_password);
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function handleSetPassword(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const { new_password } = setPasswordSchema.parse(req.body);
    await setPassword(userId, new_password);
    res.status(200).json({ message: 'Password set successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function handleResetPassword(req: Request, res: Response) {
  try {
    const { email, code, new_password } = resetPasswordSchema.parse(req.body);
    
    // Verify the verification code
    await verifyCode(email, code, VerificationCodeType.RESET_PASSWORD);
    
    // Reset the password
    await resetPassword(email, new_password);
    
    // Invalidate all verification codes for this email
    await invalidateVerificationCodes(email);
    
    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function handleOAuthRedirect(req: Request, res: Response) {
  try {
    const provider = req.params.provider as AuthProvider;
    if (![AuthProvider.GOOGLE, AuthProvider.GITHUB].includes(provider)) {
      return res.status(400).json({ error: 'Unsupported provider' });
    }

    // Generate state for CSRF protection
    const state = Buffer.from(JSON.stringify({
      random: Math.random().toString(36).substring(7),
      timestamp: Date.now()
    })).toString('base64');

    let authUrl: string;
    if (provider === AuthProvider.GOOGLE) {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const callbackUrl = process.env.GOOGLE_CALLBACK_URL;
      
      if (!clientId || !callbackUrl) {
        return res.status(500).json({ 
          error: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CALLBACK_URL environment variables.' 
        });
      }
      
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
        client_id: clientId,
        redirect_uri: callbackUrl,
        response_type: 'code',
        scope: 'email profile',
        state
      });
    } else {
      const clientId = process.env.GITHUB_CLIENT_ID;
      const callbackUrl = process.env.GITHUB_CALLBACK_URL;
      
      if (!clientId || !callbackUrl) {
        return res.status(500).json({ 
          error: 'GitHub OAuth is not configured. Please set GITHUB_CLIENT_ID and GITHUB_CALLBACK_URL environment variables.' 
        });
      }
      
      authUrl = `https://github.com/login/oauth/authorize?` + new URLSearchParams({
        client_id: clientId,
        redirect_uri: callbackUrl,
        scope: 'user:email',
        state
      });
    }

    res.status(200).json({ auth_url: authUrl });
  } catch (error) {
    console.error('OAuth redirect error:', error);
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function handleOAuthCallback(req: Request, res: Response) {
  try {
    const provider = req.params.provider as AuthProvider;
    const code = req.query.code as string;
    const state = req.query.state as string;

    if (![AuthProvider.GOOGLE, AuthProvider.GITHUB].includes(provider)) {
      return res.status(400).json({ error: 'Unsupported provider' });
    }

    let userInfo: OAuthUserInfo;
    if (provider === AuthProvider.GOOGLE) {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
          grant_type: 'authorization_code'
        })
      });
      const tokenData = await tokenRes.json();
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const googleUser = await userRes.json();
      
      userInfo = {
        provider: AuthProvider.GOOGLE,
        providerId: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        avatarUrl: googleUser.picture
      };
    } else {
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID!,
          client_secret: process.env.GITHUB_CLIENT_SECRET!,
          code
        })
      });
      const tokenData = await tokenRes.json();
      const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `token ${tokenData.access_token}` }
      });
      const githubUser = await userRes.json();
      
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `token ${tokenData.access_token}` }
      });
      const emails = await emailRes.json();
      const primaryEmail = emails.find((e: any) => e.primary && e.verified)?.email || githubUser.email;
      
      userInfo = {
        provider: AuthProvider.GITHUB,
        providerId: githubUser.id.toString(),
        email: primaryEmail,
        name: githubUser.name || githubUser.login,
        avatarUrl: githubUser.avatar_url
      };
    }

    const user = await findOrCreateOAuthUser(userInfo);
    const token = generateToken(user);

    // Redirect to frontend with token and user data in URL params
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const userData = encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      username: user.username,
      level: user.level
    }));
    res.status(200).redirect(`${frontendUrl}/auth/callback?token=${token}&user=${userData}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const errorMessage = encodeURIComponent((error as Error).message);
    res.status(400).redirect(`${frontendUrl}/login?error=${errorMessage}`);
  }
}

export async function handleLinkOAuth(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const provider = req.body.provider as AuthProvider;
    const code = req.body.code as string;

    let userInfo: OAuthUserInfo;
    if (provider === AuthProvider.GOOGLE) {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
          grant_type: 'authorization_code'
        })
      });
      const tokenData = await tokenRes.json();
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const googleUser = await userRes.json();
      userInfo = {
        provider: AuthProvider.GOOGLE,
        providerId: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        avatarUrl: googleUser.picture
      };
    } else if (provider === AuthProvider.GITHUB) {
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID!,
          client_secret: process.env.GITHUB_CLIENT_SECRET!,
          code
        })
      });
      const tokenData = await tokenRes.json();
      const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `token ${tokenData.access_token}` }
      });
      const githubUser = await userRes.json();
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `token ${tokenData.access_token}` }
      });
      const emails = await emailRes.json();
      const primaryEmail = emails.find((e: any) => e.primary && e.verified)?.email || githubUser.email;
      userInfo = {
        provider: AuthProvider.GITHUB,
        providerId: githubUser.id.toString(),
        email: primaryEmail,
        name: githubUser.name || githubUser.login,
        avatarUrl: githubUser.avatar_url
      };
    } else {
      return res.status(400).json({ error: 'Unsupported provider' });
    }

    const user = await linkOAuthAccount(userId, userInfo);
    res.status(200).json({ message: 'Account linked successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function handleUnlinkOAuth(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const provider = req.params.provider as AuthProvider;
    await unlinkOAuthAccount(userId, provider);
    res.status(200).json({ message: 'Account unlinked successfully' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

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
