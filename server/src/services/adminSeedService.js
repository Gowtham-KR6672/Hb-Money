import bcrypt from 'bcrypt';
import User from '../models/User.js';

export default async function ensureAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await User.findOneAndUpdate(
    { email: adminEmail },
    {
      name: 'HB Money Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      accountStatus: 'active'
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );
}
