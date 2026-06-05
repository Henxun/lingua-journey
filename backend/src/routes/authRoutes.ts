import { Router } from 'express';
import { 
  register, 
  login, 
  sendEmailCode, 
  verifyEmailCode,
  getProfile,
  updateProfile,
  handleChangePassword,
  handleOAuthRedirect,
  handleOAuthCallback,
  handleLinkOAuth,
  handleUnlinkOAuth,
  handleResetPassword,
  getAccountInfo
} from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.post('/email/send-code', sendEmailCode);
router.post('/email/verify-code', verifyEmailCode);

router.post('/oauth/:provider/redirect', handleOAuthRedirect);
router.get('/oauth/:provider/callback', handleOAuthCallback);

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/change-password', authenticate, handleChangePassword);

router.post('/link-oauth', authenticate, handleLinkOAuth);
router.delete('/unlink-oauth/:provider', authenticate, handleUnlinkOAuth);

router.post('/password-reset/reset', handleResetPassword);

router.get('/account', authenticate, getAccountInfo);

export default router;