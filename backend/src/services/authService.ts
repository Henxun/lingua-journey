import { AppDataSource } from '../config/database';
import { User, AuthProvider } from '../entities/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userRepository = AppDataSource.getRepository(User);

export function generateToken(user: User): string {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );
}

export async function registerUser(data: {
  email: string;
  username: string;
  password: string;
  native_language: string;
  target_language: string;
}) {
  const existingUser = await userRepository.findOne({
    where: [{ email: data.email }, { username: data.username }]
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  const password_hash = await bcrypt.hash(data.password, 10);
  const user = userRepository.create({ 
    ...data, 
    password_hash,
    auth_provider: AuthProvider.EMAIL
  });
  
  return await userRepository.save(user);
}

export async function loginUser(email: string, password: string) {
  const user = await userRepository.findOne({ where: { email } });
  
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user);
  return { user, token };
}

export async function registerOrLoginWithCode(
  email: string,
  userData?: {
    username?: string;
    native_language?: string;
    target_language?: string;
  }
) {
  let user = await userRepository.findOne({ where: { email } });
  
  if (!user) {
    if (!userData?.username || !userData?.native_language || !userData?.target_language) {
      throw new Error('Missing user registration data');
    }
    user = userRepository.create({
      email,
      username: userData.username,
      native_language: userData.native_language,
      target_language: userData.target_language,
      auth_provider: AuthProvider.EMAIL,
      email_verified: true
    });
    user = await userRepository.save(user);
  } else {
    user.email_verified = true;
    user = await userRepository.save(user);
  }

  const token = generateToken(user);
  return { user, token };
}

export async function getUserProfile(userId: string) {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

export async function updateUserProfile(
  userId: string,
  data: {
    username?: string;
    native_language?: string;
    target_language?: string;
    avatar_url?: string;
  }
) {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  if (data.username && data.username !== user.username) {
    const existingUser = await userRepository.findOne({ where: { username: data.username } });
    if (existingUser) {
      throw new Error('Username already taken');
    }
  }

  Object.assign(user, data);
  return await userRepository.save(user);
}

export async function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
) {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.password_hash) {
    throw new Error('Please set a password first');
  }

  const isValid = await bcrypt.compare(oldPassword, user.password_hash);
  if (!isValid) {
    throw new Error('Current password is incorrect');
  }

  user.password_hash = await bcrypt.hash(newPassword, 10);
  return await userRepository.save(user);
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };
  } catch {
    throw new Error('Invalid token');
  }
}