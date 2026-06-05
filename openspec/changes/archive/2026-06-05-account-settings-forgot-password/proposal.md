## Why

当前 Lingua Journey 的认证系统缺少账户设置和密码恢复功能。用户无法关联或解绑 OAuth 账户，也无法在忘记密码时重置密码，这影响了用户体验和账户安全性。

## What Changes

**账户设置功能：**
- 创建账户设置页面 `/profile/settings`
- 显示当前账户的登录方式（邮箱、Google、GitHub）
- 支持关联新的 OAuth 账户到现有邮箱账户
- 支持解绑已关联的 OAuth 账户（保留至少一种登录方式）
- 支持修改用户名和语言偏好

**忘记密码功能：**
- 创建忘记密码页面 `/forgot-password`
- 输入邮箱地址获取重置密码验证码
- 验证码有效期 15 分钟
- 输入新密码完成重置
- 发送重置邮件通知

## Capabilities

### New Capabilities

- `account-settings`: 用户账户设置管理，包括查看登录方式、关联/解绑 OAuth 账户、修改个人偏好
- `password-recovery`: 密码恢复功能，包括验证码发送、密码重置

### Modified Capabilities

- `user-auth`: 修改登录功能，支持忘记密码流程中的邮箱验证登录方式

## Impact

**后端改动：**
- 新增 `PUT /api/auth/account` 端点：更新账户设置
- 新增 `POST /api/auth/link-oauth` 端点：关联 OAuth 账户
- 新增 `DELETE /api/auth/unlink-oauth/:provider` 端点：解绑 OAuth 账户
- 扩展 `emailService.ts`：支持忘记密码邮件模板
- 扩展 `authController.ts`：新增账户设置和密码重置路由处理
- 扩展 `authRoutes.ts`：新增相关路由

**前端改动：**
- 新增 `/profile/settings` 页面：账户设置 UI
- 新增 `/forgot-password` 页面：忘记密码 UI
- 扩展 `AuthContext.tsx`：新增账户设置相关方法
- 扩展 `api.ts`：新增相关 API 调用方法
- 更新现有页面导航和用户体验
