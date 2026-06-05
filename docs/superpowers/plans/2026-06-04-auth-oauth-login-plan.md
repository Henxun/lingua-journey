---
change: auth-oauth-login
design-doc: docs/superpowers/specs/2026-06-04-multilingual-ai-education-platform-design.md
base-ref: no-git-repo
---

# OAuth登录/注册功能实施计划

## 概述

本计划实现支持 Google、GitHub 和邮箱验证码三种登录方式的完整登录/注册系统。

## 阶段一：后端数据库和实体更新

### Task 1.1：修改 User 实体，增加 OAuth 相关字段

**文件：** `backend/src/entities/User.ts`

**变更内容：**
- 新增 AuthProvider 枚举（email, google, github）
- 新增 auth_provider 字段
- 新增 provider_id 字段
- 新增 email_verified 字段
- 新增 oauth_profiles JSON 字段
- password_hash 设为 nullable（OAuth 用户不需要密码）

**步骤：**
1. 读取现有 User.ts
2. 增加新字段和枚举
3. 保存文件

### Task 1.2：创建 VerificationCode 实体

**文件：** `backend/src/entities/VerificationCode.ts`

**内容：**
- id (UUID)
- email
- code (6位数字)
- type (register/login/reset_password)
- expires_at
- is_used
- created_at

### Task 1.3：更新 database.ts 配置

**文件：** `backend/src/config/database.ts`

**变更内容：**
- 在 entities 数组中新增 VerificationCode

---

## 阶段二：后端依赖安装和环境配置

### Task 2.1：安装后端依赖

**执行命令：**
```bash
cd backend
npm install passport passport-google-oauth20 passport-github2 nodemailer express-session
npm install -D @types/passport @types/passport-google-oauth20 @types/passport-github2 @types/nodemailer @types/express-session
```

**依赖列表：**
- passport
- passport-google-oauth20
- passport-github2
- nodemailer
- express-session
- 对应 TypeScript 类型定义

### Task 2.2：更新 .env.example 文件

**文件：** `backend/.env.example`

**新增内容：**
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

---

## 阶段三：后端 OAuth 服务和控制器

### Task 3.1：创建 OAuth 服务

**文件：** `backend/src/services/oauthService.ts`

**功能：**
- 生成 OAuth 授权 URL
- 处理 OAuth 回调获取用户信息
- 查找或创建 OAuth 用户
- 关联 OAuth 账户到现有用户

### Task 3.2：创建邮箱验证码服务

**文件：** `backend/src/services/emailService.ts`

**功能：**
- 生成 6 位随机验证码
- 发送验证邮件（使用 nodemailer）
- 验证验证码有效性
- 60秒限流检查
- 15分钟过期检查

### Task 3.3：更新 authService.ts

**文件：** `backend/src/services/authService.ts`

**新增功能：**
- 邮箱验证码登录/注册
- 获取用户资料
- 更新用户资料
- 关联/解绑 OAuth 账户

### Task 3.4：更新 authController.ts

**文件：** `backend/src/controllers/authController.ts`

**新增端点：**
- POST /oauth/:provider/redirect
- GET /oauth/:provider/callback
- POST /email/send-code
- POST /email/verify-code
- GET /profile
- PUT /profile
- POST /link-oauth
- DELETE /unlink-oauth/:provider

### Task 3.5：创建 OAuth 配置文件

**文件：** `backend/src/config/passport.ts`

**功能：**
- 配置 Google OAuth 策略
- 配置 GitHub OAuth 策略
- 序列化/反序列化用户

### Task 3.6：更新 authRoutes.ts

**文件：** `backend/src/routes/authRoutes.ts`

**新增路由：**
- OAuth 相关路由
- 邮箱验证码相关路由
- 个人资料相关路由

### Task 3.7：更新 server.ts

**文件：** `backend/src/server.ts`

**变更内容：**
- 引入 passport
- 引入 express-session
- 配置 session 中间件
- 配置 passport 初始化

---

## 阶段四：前端基础页面

### Task 4.1：创建前端登录页面

**文件：** `frontend/src/pages/login.tsx`

**UI 组件：**
- Logo 和标题
- Google 登录按钮
- GitHub 登录按钮
- 邮箱验证码登录表单
- 注册链接
- 忘记密码链接

### Task 4.2：创建前端注册页面

**文件：** `frontend/src/pages/register.tsx`

**UI 组件：**
- Logo 和标题
- 注册表单（邮箱、用户名、母语、目标语言）
- 发送验证码按钮
- 验证码输入
- 登录链接

### Task 4.3：创建 OAuth 回调处理页面

**文件：** `frontend/src/pages/auth/callback.tsx`

**功能：**
- 从 URL 获取 token
- 存储 token 到 localStorage
- 跳转到首页或 dashboard

### Task 4.4：创建个人资料页面

**文件：** `frontend/src/pages/profile/index.tsx`

**UI 组件：**
- 用户头像
- 用户信息展示
- 编辑资料按钮
- 语言学习进度展示

### Task 4.5：创建账户设置页面

**文件：** `frontend/src/pages/profile/settings.tsx`

**UI 组件：**
- 关联的登录方式展示
- 关联/解绑 OAuth 账户按钮
- 修改密码选项
- 通知设置

### Task 4.6：创建忘记密码页面

**文件：** `frontend/src/pages/forgot-password.tsx`

**UI 组件：**
- 邮箱输入
- 发送重置验证码按钮
- 验证码输入
- 新密码输入

---

## 阶段五：前端组件和状态管理

### Task 5.1：创建 AuthContext 和 useAuth hook

**文件：** `frontend/src/contexts/AuthContext.tsx`

**功能：**
- 管理用户登录状态
- 存储和访问 token
- 登录/登出方法
- 获取当前用户信息

### Task 5.2：创建 Google 和 GitHub 登录按钮组件

**文件：** `frontend/src/components/GoogleLoginButton.tsx`
**文件：** `frontend/src/components/GitHubLoginButton.tsx`

**功能：**
- 美观的按钮 UI
- 点击跳转到 OAuth 授权 URL

### Task 5.3：创建邮箱验证码输入组件

**文件：** `frontend/src/components/EmailCodeInput.tsx`

**功能：**
- 6个输入框，自动跳转
- 倒计时显示
- 重新发送按钮

### Task 5.4：更新 _app.tsx

**文件：** `frontend/src/pages/_app.tsx`

**变更内容：**
- 引入 AuthProvider
- 包裹 App 组件

---

## 阶段六：测试和验证

### Task 6.1：本地测试 OAuth 登录流程

### Task 6.2：测试邮箱验证码功能

### Task 6.3：测试个人资料和设置页面

### Task 6.4：运行构建，确保无错误
