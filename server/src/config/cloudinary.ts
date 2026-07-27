import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'charan12',
  api_key: process.env.CLOUDINARY_API_KEY || '478681192216688',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'du1JrEvTmjfmDiDa-Yi9cfP4MWc',
  secure: true,
});

export default cloudinary;
