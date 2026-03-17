import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'HB Money User' },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, default: '' },
    password: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    accountStatus: { type: String, enum: ['active', 'disabled'], default: 'active' },
    otpCode: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    otpPurpose: { type: String, default: null },
    shareCode: { type: String, default: null, index: true },
    shareCodeExpiresAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
