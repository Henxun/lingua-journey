# 任务清单：账户设置和忘记密码功能

## 第一阶段：后端 API 路由和控制器

- [ ] **Task 1.1**：创建获取账户信息 API（GET `/api/auth/account`）
- [ ] **Task 1.2**：创建更新个人资料 API（PUT `/api/auth/account/profile`）
- [ ] **Task 1.3**：创建关联 OAuth 账户 API（POST `/api/auth/account/link-oauth`）
- [ ] **Task 1.4**：创建解绑 OAuth 账户 API（POST `/api/auth/account/unlink-oauth`）
- [ ] **Task 1.5**：创建请求密码重置 API（POST `/api/auth/password-reset/request`）
- [ ] **Task 1.6**：创建验证密码重置码 API（POST `/api/auth/password-reset/verify`）
- [ ] **Task 1.7**：创建设置新密码 API（POST `/api/auth/password-reset/set-password`）

## 第二阶段：后端服务层更新

- [ ] **Task 2.1**：更新 authService.ts，增加关联/解绑 OAuth 账户方法
- [ ] **Task 2.2**：更新 authService.ts，增加密码重置相关方法
- [ ] **Task 2.3**：更新 authController.ts，实现密码重置端点
- [ ] **Task 2.4**：更新 authRoutes.ts，注册新路由
- [ ] **Task 2.5**：实现安全防护（暴力破解防护、邮箱枚举防护）

## 第三阶段：前端账户设置页面

- [ ] **Task 3.1**：创建账户设置页面（`/profile/settings.tsx`）
- [ ] **Task 3.2**：实现账户信息展示组件（显示关联的登录方式）
- [ ] **Task 3.3**：实现关联 OAuth 按钮组件（Google/GitHub 关联）
- [ ] **Task 3.4**：实现解绑 OAuth 功能
- [ ] **Task 3.5**：实现更新个人资料表单（用户名、语言偏好）
- [ ] **Task 3.6**：创建 OAuth 关联回调处理页面

## 第四阶段：前端忘记密码页面

- [ ] **Task 4.1**：创建忘记密码页面（`/forgot-password.tsx`）
- [ ] **Task 4.2**：创建密码重置验证码输入组件
- [ ] **Task 4.3**：创建设置新密码页面（`/reset-password.tsx`）
- [ ] **Task 4.4**：实现密码强度验证组件
- [ ] **Task 4.5**：实现忘记密码流程的状态管理

## 第五阶段：前端组件和状态管理

- [ ] **Task 5.1**：更新 AuthContext，支持账户信息获取
- [ ] **Task 5.2**：更新 API 客户端，添加新端点
- [ ] **Task 5.3**：添加加载状态和错误处理

## 第六阶段：测试和验证

- [ ] **Task 6.1**：测试账户设置页面功能
- [ ] **Task 6.2**：测试 OAuth 关联/解绑功能
- [ ] **Task 6.3**：测试忘记密码流程
- [ ] **Task 6.4**：测试安全防护（错误次数限制、邮箱枚举防护）
- [ ] **Task 6.5**：运行构建，确保无错误

## 依赖关系

- 第二阶段依赖第一阶段完成
- 第三、四阶段依赖第一、二阶段完成
- 第五阶段与第三、四阶段并行开发
- 第六阶段依赖所有前面阶段完成

## 完成总结

待实现功能：
- [ ] 账户设置页面（查看/关联/解绑 OAuth）
- [ ] 更新个人资料（用户名、语言偏好）
- [ ] 忘记密码功能
- [ ] 密码重置功能
