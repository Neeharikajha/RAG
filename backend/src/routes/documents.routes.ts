import { Router } from "express";
import { upload } from "../middleware/upload.js";
import {
  uploadDocuments,
  listDocuments,
} from "../controllers/documents.controller.js";

const router = Router();

router.post("/", upload.array("files"), uploadDocuments);
router.get("/", listDocuments);

export default router;
