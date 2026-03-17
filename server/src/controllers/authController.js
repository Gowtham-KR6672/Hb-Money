import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendOtpEmail } from '../services/brevoService.js';
import generateOtp from '../utils/generateOtp.js';
import { serializeUser } from '../utils/serializers.js';

export const otpRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { message: 'Too many OTP requests. Please try again later.' }
});

export const sendOtpValidators = [body('email').isEmail().withMessage('Valid email required')];
export const registerValidators = [
  body('name').isString().isLength({ min: 2 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
];
export const loginValidators = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];
export const verifyOtpValidators = [
  body('email').isEmail().withMessage('Valid email required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
];
export const adminLoginValidators = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password is required')
];

function buildAuthPayload(user) {
  return {
    token: jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'hb-money-secret', {
      expiresIn: '7d'
    }),
    user: serializeUser(user)
  };
}

export async function sendOtp(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, purpose = 'register' } = req.body;
    const otp = generateOtp();
    const user = (await User.findOne({ email })) || (await User.create({ email }));

    if (purpose === 'register' && user.password && user.role !== 'admin') {
      return res.status(409).json({ message: 'An account already exists for this email.' });
    }

    user.otpCode = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.otpPurpose = purpose;
    await user.save();

    await sendOtpEmail(email, otp);
    return res.json({ message: 'OTP sent successfully.' });
  } catch (error) {
    return next(error);
  }
}

export async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { name, email, phone = '', password, otp } = req.body;
    const user = await User.findOne({ email });
    if (
      !user ||
      user.otpPurpose !== 'register' ||
      user.otpCode !== otp ||
      !user.otpExpiresAt ||
      user.otpExpiresAt < new Date()
    ) {
      return res.status(400).json({ message: 'OTP is invalid or expired.' });
    }

    user.name = name;
    user.phone = phone;
    user.password = await bcrypt.hash(password, 10);
    user.otpCode = null;
    user.otpExpiresAt = null;
    user.otpPurpose = null;
    await user.save();

    return res.json(buildAuthPayload(user));
  } catch (error) {
    return next(error);
  }
}

export async function loginUser(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'user' });
    if (!user || user.accountStatus !== 'active' || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    return res.json(buildAuthPayload(user));
  } catch (error) {
    return next(error);
  }
}

export async function adminLogin(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'admin' });
    if (!user || user.accountStatus !== 'active' || !user.password) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    return res.json(buildAuthPayload(user));
  } catch (error) {
    return next(error);
  }
}
