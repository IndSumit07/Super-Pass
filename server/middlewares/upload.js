// middleware/upload.js
import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per image
    files: 2,
  },
});

// Expect fields: banner (1), logo (1)
export const uploadEventMedia = upload.fields([
  { name: "banner", maxCount: 1 },
  { name: "logo", maxCount: 1 },
]);
