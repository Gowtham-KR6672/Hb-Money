export function serializeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    profileImage: user.profileImage,
    role: user.role,
    accountStatus: user.accountStatus,
    createdAt: user.createdAt
  };
}
