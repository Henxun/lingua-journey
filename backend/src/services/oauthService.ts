import { AppDataSource } from '../config/database';
import { User, AuthProvider } from '../entities/User';

const userRepository = AppDataSource.getRepository(User);

export interface OAuthUserInfo {
  provider: AuthProvider;
  providerId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export async function findOrCreateOAuthUser(userInfo: OAuthUserInfo): Promise<User> {
  let user = await userRepository.findOne({
    where: [
      { auth_provider: userInfo.provider, provider_id: userInfo.providerId },
      { email: userInfo.email }
    ]
  });

  if (!user) {
    const randomUsername = `${userInfo.name?.replace(/\s+/g, '_').toLowerCase() || 'user'}_${Date.now()}`;
    user = userRepository.create({
      email: userInfo.email,
      username: randomUsername,
      native_language: 'zh',
      target_language: 'en',
      auth_provider: userInfo.provider,
      provider_id: userInfo.providerId,
      email_verified: true,
      avatar_url: userInfo.avatarUrl,
      oauth_profiles: {
        [userInfo.provider]: {
          id: userInfo.providerId,
          email: userInfo.email,
          avatar_url: userInfo.avatarUrl
        }
      }
    });
    user = await userRepository.save(user);
  } else if (!user.provider_id) {
    user.auth_provider = userInfo.provider;
    user.provider_id = userInfo.providerId;
    user.email_verified = true;
    if (!user.avatar_url && userInfo.avatarUrl) {
      user.avatar_url = userInfo.avatarUrl;
    }
    user.oauth_profiles = {
      ...user.oauth_profiles,
      [userInfo.provider]: {
        id: userInfo.providerId,
        email: userInfo.email,
        avatar_url: userInfo.avatarUrl
      }
    };
    user = await userRepository.save(user);
  }

  return user;
}

export async function linkOAuthAccount(userId: string, userInfo: OAuthUserInfo): Promise<User> {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  const existingUser = await userRepository.findOne({
    where: { auth_provider: userInfo.provider, provider_id: userInfo.providerId }
  });
  if (existingUser && existingUser.id !== userId) {
    throw new Error('This OAuth account is already linked to another user');
  }

  user.oauth_profiles = {
    ...user.oauth_profiles,
    [userInfo.provider]: {
      id: userInfo.providerId,
      email: userInfo.email,
      avatar_url: userInfo.avatarUrl
    }
  };

  return await userRepository.save(user);
}

export async function unlinkOAuthAccount(userId: string, provider: AuthProvider): Promise<User> {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  if (user.auth_provider === provider && !user.password_hash) {
    throw new Error('Cannot unlink the only login method');
  }

  if (user.oauth_profiles) {
    delete user.oauth_profiles[provider];
  }

  return await userRepository.save(user);
}
