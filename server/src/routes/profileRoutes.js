import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import {
  deleteProfile,
  getProfile,
  requestPasswordOtp,
  updatePassword,
  updatePasswordValidators,
  updateProfile,
  updateProfileValidators,
  verifyPasswordOtp,
  verifyPasswordOtpValidators
} from '../controllers/profileController.js';

const router = Router();
const upload = multer({ dest: 'server/uploads/' });

router.use(requireAuth);
router.get('/', getProfile);
router.put('/', upload.single('profilePhoto'), updateProfileValidators, updateProfile);
router.put('/password', updatePasswordValidators, updatePassword);
router.post('/password/request-otp', requestPasswordOtp);
router.post('/password/verify-otp', verifyPasswordOtpValidators, verifyPasswordOtp);
router.delete('/', deleteProfile);

export default router;
