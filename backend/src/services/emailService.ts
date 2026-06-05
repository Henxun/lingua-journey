import nodemailer from 'nodemailer';
import { AppDataSource } from '../config/database';
import { VerificationCode, VerificationCodeType } from '../entities/VerificationCode';
import dotenv from 'dotenv';

dotenv.config();

const verificationCodeRepository = AppDataSource.getRepository(VerificationCode);

function generateRandomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function checkRateLimit(email: string): Promise<void> {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const recentCode = await verificationCodeRepository.findOne({
    where: { email },
    order: { created_at: 'DESC' }
  });

  if (recentCode && new Date(recentCode.created_at) > oneMinuteAgo) {
    throw new Error('Please wait 60 seconds before requesting another code');
  }
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  // Check if SMTP is configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    // Development mode: log verification code to console
    console.log('========================================');
    console.log('📧 Email would send to:', to);
    console.log('📧 Subject:', subject);
    console.log('📧 Content:', html);
    console.log('========================================');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html
  });
}

export async function sendVerificationCode(
  email: string,
  type: VerificationCodeType
): Promise<void> {
  await checkRateLimit(email);

  const code = generateRandomCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const verificationCode = verificationCodeRepository.create({
    email,
    code,
    type,
    expires_at: expiresAt,
    is_used: false
  });

  await verificationCodeRepository.save(verificationCode);

  const subject = getEmailSubject(type);
  const html = getEmailTemplate(code, type);

  // Always log the verification code to console for development
  console.log('========================================');
  console.log('📧 Verification Code Generated!');
  console.log('📧 Email:', email);
  console.log('📧 Type:', type);
  console.log('📧 Code:', code);
  console.log('========================================');

  try {
    await sendEmail(email, subject, html);
  } catch (error) {
    console.error('Failed to send email, but code is still valid:', error);
    // Don't throw error in development - just log it
    // The code is already saved and can be used
  }
}

export async function verifyCode(
  email: string,
  code: string,
  type: VerificationCodeType
): Promise<boolean> {
  const verificationCode = await verificationCodeRepository.findOne({
    where: { email, code, type, is_used: false }
  });

  if (!verificationCode) {
    throw new Error('Invalid verification code');
  }

  if (new Date() > new Date(verificationCode.expires_at)) {
    throw new Error('Verification code has expired');
  }

  verificationCode.is_used = true;
  await verificationCodeRepository.save(verificationCode);

  return true;
}

function getEmailSubject(type: VerificationCodeType): string {
  switch (type) {
    case VerificationCodeType.REGISTER:
      return '欢迎注册 Lingua Journey';
    case VerificationCodeType.LOGIN:
      return '您的登录验证码';
    case VerificationCodeType.RESET_PASSWORD:
      return '重置密码验证码';
  }
}

function getEmailTemplate(code: string, type: VerificationCodeType): string {
  let message = '';
  switch (type) {
    case VerificationCodeType.REGISTER:
      message = '感谢您注册 Lingua Journey！请使用以下验证码完成注册：';
      break;
    case VerificationCodeType.LOGIN:
      message = '请使用以下验证码登录 Lingua Journey：';
      break;
    case VerificationCodeType.RESET_PASSWORD:
      message = '请使用以下验证码重置您的密码：';
      break;
  }

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Lingua Journey</h2>
      <p>${message}</p>
      <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
        ${code}
      </div>
      <p style="color: #666;">验证码将在 15 分钟后过期。</p>
      <p style="color: #999; font-size: 12px;">如果您没有请求此验证码，请忽略此邮件。</p>
    </div>
  `;
}
