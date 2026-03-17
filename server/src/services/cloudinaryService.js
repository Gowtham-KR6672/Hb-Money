import { v2 as cloudinary } from 'cloudinary';

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

export async function uploadProfileImage(filePath) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return { secure_url: filePath };
  }

  configureCloudinary();

  return cloudinary.uploader.upload(filePath, {
    folder: 'hb-money/profiles'
  });
}
