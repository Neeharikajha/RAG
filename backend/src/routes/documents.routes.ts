import { Router } from "express";
import { upload } from "../middleware/upload.js";
import {
  uploadDocuments,
  listDocuments,
  deleteDocument,
  getVectorStatus,
} from "../controllers/documents.controller.js";

const router = Router();

router.get("/vector-status", getVectorStatus);
router.post("/", upload.array("files"), uploadDocuments);
router.get("/", listDocuments);
router.delete("/:id", deleteDocument);

export default router;


