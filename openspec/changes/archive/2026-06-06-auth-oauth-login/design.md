# 设计文档：OAuth登录/注册功能

## 技术架构

### 后端技术栈
- **OAuth 库**: `passport.js` + `passport-google-oauth20` + `passport-github2`
- **邮箱服务**: `nodemailer`（SMTP或第三方邮件服务）
- **验证码存储**: `redis`（用于存储邮箱验证码，带过期时间）
- **现有技术**: Express + TypeORM + JWT

### 前端技术栈
- Next.js (Pages Router)
- Tailwind CSS
- React Hooks for state management
- `next-auth` 或自定义 OAuth flow

## 数据库设计

### 修改 User 实体

在现有 User 实体基础上增加以下字段：

```typescript
// backend/src/entities/User.ts (修改)
export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  GITHUB = 'github'
}

// 新增字段：
@Column({
  type: 'enum',
  enum: AuthProvider,
  default: AuthProvider.EMAIL,
  nullable: false
})
auth_provider: AuthProvider;

@Column({ nullable: true })
provider_id: string; // OAuth provider 唯一 ID (Google ID, GitHub ID)

@Column({ nullable: true })
email_verified: boolean; // 邮箱是否已验证

@Column({ type: 'json', nullable: true })
oauth_profiles: {
  google?: { id: string; email: string; avatar_url?: string };
  github?: { id: string; email: string; avatar_url?: string };
};
```

### 新增 VerificationCode 实体

```typescript
// backend/src/entities/VerificationCode.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('verification_codes')
export class VerificationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  code: string; // 6位数字验证码

  @Column()
  type: 'register' | 'login' | 'reset_password'; // 验证码用途

  @Column({ type: 'timestamp' })
  expires_at: Date; // 过期时间（通常15分钟后）

  @Column({ default: false })
  is_used: boolean; // 是否已使用

  @CreateDateColumn()
  created_at: Date;
}
```

## API 设计

### 新增 API 端点

```
POST   /api/auth/oauth/:provider/redirect  // 获取 OAuth 重定向 URL
GET    /api/auth/oauth/:provider/callback  // OAuth 回调处理
POST   /api/auth/email/send-code          // 发送邮箱验证码
POST   /api/auth/email/verify-code        // 验证邮箱验证码并登录/注册
POST   /api/auth/email/login              // 邮箱密码登录（保留现有）
POST   /api/auth/email/register           // 邮箱密码注册（保留现有）
GET    /api/auth/profile                  // 获取当前用户信息（需认证）
PUT    /api/auth/profile                  // 更新用户信息（需认证）
POST   /api/auth/link-oauth               // 关联 OAuth 账户（需认证）
DELETE /api/auth/unlink-oauth/:provider   // 解绑 OAuth 账户（需认证）
```

## OAuth 流程设计

### Google OAuth 流程

```
前端点击 "Google登录" 
  ↓
前端调用 GET /api/auth/oauth/google/redirect
  ↓
后端返回 Google OAuth 授权 URL
  ↓
前端跳转到 Google 授权页面
  ↓
用户授权后 Google 重定向到 /api/auth/oauth/google/callback
  ↓
后端获取 access_token，调用 Google API 获取用户信息
  ↓
后端查找或创建用户（根据 Google ID 或邮箱）
  ↓
后端生成 JWT Token
  ↓
后端设置 Cookie 并跳转到前端 /dashboard 或 /callback 页面
  ↓
前端获取到 Token 后存储，完成登录
```

### GitHub OAuth 流程

与 Google 类似，只是 provider 换成 github。

## 邮箱验证码流程设计

### 发送验证码

```
前端输入邮箱，点击 "发送验证码"
  ↓
POST /api/auth/email/send-code { email, type }
  ↓
后端验证邮箱格式
  ↓
检查 60 秒内是否已发送过
  ↓
生成 6 位随机数字验证码
  ↓
存储到数据库（15分钟过期）
  ↓
使用 nodemailer 发送邮件
  ↓
返回成功
```

### 验证验证码

```
POST /api/auth/email/verify-code { email, code, type, ...optionalUserData }
  ↓
后端验证验证码是否有效
  ↓
检查是否过期、已使用
  ↓
根据 type 处理：
  - register: 创建用户并登录
  - login: 查找用户并登录
  - reset_password: 重置密码
  ↓
标记验证码为已使用
  ↓
返回 JWT Token
```

## 前端页面设计

### 页面结构

```
frontend/src/pages/
├── login.tsx               // 登录页面
├── register.tsx            // 注册页面
├── forgot-password.tsx     // 忘记密码
├── profile/
│   ├── index.tsx           // 个人资料页面
│   └── settings.tsx        // 账户设置页面
└── auth/
    └── callback.tsx        // OAuth 回调处理页面
```

### 登录页面 (login.tsx)

**UI 组件：**
- Logo 和标题
- 三个登录选项卡片：
  1. Google 登录按钮（带 Google 图标）
  2. GitHub 登录按钮（带 GitHub 图标）
  3. 邮箱验证码登录表单
- "还没有账号？立即注册" 链接
- "忘记密码" 链接

## 安全性设计

### OAuth 安全

- 使用 state 参数防止 CSRF 攻击
- 使用 nonce 参数防止重放攻击
- 严格验证回调 URL
- access_token 不存储在前端，仅在服务端使用

### 邮箱验证码安全

- 验证码 6 位数字，15分钟过期
- 同一邮箱 60 秒内只能发送一次
- 验证码使用后立即失效
- 暴力破解防护：限制验证次数

### JWT 安全

- 24小时过期时间
- 使用强 secret 密钥
- 支持 refresh token（可选）

## 环境变量

新增以下环境变量到 backend/.env：

```env
# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/oauth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/oauth/github/callback

# Email SMTP
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@linguajourney.com
```

## 依赖安装

### 后端依赖

```bash
cd backend
npm install passport passport-google-oauth20 passport-github2 nodemailer express-session
npm install -D @types/passport @types/passport-google-oauth20 @types/passport-github2 @types/nodemailer @types/express-session
```

### 前端依赖

```bash
cd frontend
npm install @react-oauth/google  # 可选，或者使用自定义实现
```
