import multer from "multer";
import { UPLOAD_DIR } from "../config/env.js";

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

export const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB per file
});
