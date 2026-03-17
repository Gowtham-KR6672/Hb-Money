import { Router } from 'express';
import {
  adminLogin,
  adminLoginValidators,
  loginUser,
  loginValidators,
  otpRateLimit,
  register,
  registerValidators,
  sendOtp,
  sendOtpValidators
} from '../controllers/authController.js';

const router = Router();

router.post('/send-otp', otpRateLimit, sendOtpValidators, sendOtp);
router.post('/register', registerValidators, register);
router.post('/login', loginValidators, loginUser);
router.post('/admin-login', adminLoginValidators, adminLogin);

export default router;
