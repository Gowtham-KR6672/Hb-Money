import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { uploadProfileImage } from '../services/cloudinaryService.js';
import { sendOtpEmail } from '../services/brevoService.js';
import generateOtp from '../utils/generateOtp.js';
import { serializeUser } from '../utils/serializers.js';

export const updateProfileValidators = [
  body('name').optional().isString(),
  body('email').optional().isEmail(),
  body('phone').optional().isString()
];

export const updatePasswordValidators = [body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')];
export const verifyPasswordOtpValidators = [
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

export async function getProfile(req, res) {
  res.json(serializeUser(req.user));
}

export async function updateProfile(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const updates = { ...req.body };
    if (req.file) {
      const uploaded = await uploadProfileImage(req.file.path);
      updates.profileImage = uploaded.secure_url;
    }

    Object.assign(req.user, updates);
    await req.user.save();
    return res.json(serializeUser(req.user));
  } catch (error) {
    return next(error);
  }
}

export async function updatePassword(req, res, next) {
  try {
    return res.status(400).json({ message: 'Use OTP verification to change password.' });
  } catch (error) {
    return next(error);
  }
}

export async function requestPasswordOtp(req, res, next) {
  try {
    req.user.otpCode = generateOtp();
    req.user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    req.user.otpPurpose = 'change-password';
    await req.user.save();
    await sendOtpEmail(req.user.email, req.user.otpCode);
    return res.json({ message: 'Password change OTP sent successfully.' });
  } catch (error) {
    return next(error);
  }
}

export async function verifyPasswordOtp(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    if (
      req.user.otpPurpose !== 'change-password' ||
      req.user.otpCode !== req.body.otp ||
      !req.user.otpExpiresAt ||
      req.user.otpExpiresAt < new Date()
    ) {
      return res.status(400).json({ message: 'OTP is invalid or expired.' });
    }

    req.user.password = await bcrypt.hash(req.body.password, 10);
    req.user.otpCode = null;
    req.user.otpExpiresAt = null;
    req.user.otpPurpose = null;
    await req.user.save();

    return res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    return next(error);
  }
}

export async function deleteProfile(req, res, next) {
  try {
    await req.user.deleteOne();
    return res.json({ message: 'Profile deleted.' });
  } catch (error) {
    return next(error);
  }
}
