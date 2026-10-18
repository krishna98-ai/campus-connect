import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary-v2";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const createStorage = (folder, options = {}) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      ...options,
    },
  });

const imageStorage = createStorage("campus-connect/images", {
  transformation: [
    { width: 1200, height: 1200, crop: "limit", quality: "auto" },
  ],
});

const avatarStorage = createStorage("campus-connect/avatars", {
  allowed_formats: ["jpg", "jpeg", "png", "webp"],
  transformation: [{ width: 400, height: 400, crop: "fill", quality: "auto" }],
});

const notesStorage = createStorage("campus-connect/notes", {
  allowed_formats: ["pdf", "jpg", "jpeg", "png"],
  resource_type: "auto",
});

const createUploader = (storage, maxSize, allowedMimeTypes) =>
  multer({
    storage,
    limits: { fileSize: maxSize },
    fileFilter: (req, file, cb) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error("Unsupported file type"));
      }
      cb(null, true);
    },
  });

const uploadImage = createUploader(imageStorage, 5 * 1024 * 1024, [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const uploadAvatar = createUploader(avatarStorage, 2 * 1024 * 1024, [
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const uploadNotes = createUploader(notesStorage, 20 * 1024 * 1024, [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export { cloudinary, uploadImage, uploadAvatar, uploadNotes };
