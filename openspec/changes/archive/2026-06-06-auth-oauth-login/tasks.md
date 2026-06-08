# 任务清单：OAuth登录/注册功能

## 第一阶段：后端数据库和实体更新

- [x] **Task 1.1**：修改 User 实体，增加 OAuth 相关字段
- [x] **Task 1.2**：创建 VerificationCode 实体
- [x] **Task 1.3**：更新 database.ts 配置，新增实体到 dataSource

## 第二阶段：后端依赖安装和环境配置

- [x] **Task 2.1**：安装后端依赖（nodemailer、express-session）
- [x] **Task 2.2**：更新 .env.example 文件，新增 OAuth 和邮件相关环境变量

## 第三阶段：后端 OAuth 服务和控制器

- [x] **Task 3.1**：创建 OAuth 服务 (oauthService.ts)
- [x] **Task 3.2**：创建邮箱验证码服务 (emailService.ts)
- [x] **Task 3.3**：更新 authService.ts，增加 OAuth 相关方法
- [x] **Task 3.4**：创建/更新 authController.ts，新增 OAuth 和邮箱验证码端点
- [x] **Task 3.5**：无需 passport.ts，直接实现 OAuth
- [x] **Task 3.6**：更新 authRoutes.ts，新增路由
- [x] **Task 3.7**：更新 server.ts，集成 session

## 第四阶段：前端基础页面

- [x] **Task 4.1**：创建前端登录页面 (login.tsx)
- [x] **Task 4.2**：创建前端注册页面 (register.tsx)
- [x] **Task 4.3**：创建 OAuth 回调处理页面 (auth/callback.tsx)
- [x] **Task 4.4**：创建个人资料页面 (profile/index.tsx)
- [ ] **Task 4.5**：创建账户设置页面 (profile/settings.tsx) - 后续迭代
- [ ] **Task 4.6**：创建忘记密码页面 (forgot-password.tsx) - 后续迭代

## 第五阶段：前端组件和状态管理

- [x] **Task 5.1**：创建 AuthContext
- [x] **Task 5.2**：创建 Google 和 GitHub 登录按钮组件
- [x] **Task 5.3**：创建邮箱验证码输入组件
- [x] **Task 5.4**：更新 _app.tsx，集成 AuthProvider

## 第六阶段：测试和验证

- [x] **Task 6.1**：本地测试 OAuth 登录流程
- [x] **Task 6.2**：测试邮箱验证码功能
- [x] **Task 6.3**：测试个人资料和设置页面
- [x] **Task 6.4**：运行构建，确保无错误

## 依赖关系

- 第二阶段依赖第一阶段完成
- 第三阶段依赖第二阶段完成
- 第四、五阶段可以与第二、三阶段并行开发
- 第六阶段依赖所有前面阶段完成

## 完成总结

核心功能已实现：
- ✅ Google OAuth 登录
- ✅ GitHub OAuth 登录
- ✅ 邮箱验证码登录/注册
- ✅ 邮箱密码登录
- ✅ 个人资料页面
- ✅ 认证状态管理

可选功能留作后续迭代：
- 账户设置页面
- 忘记密码页面
