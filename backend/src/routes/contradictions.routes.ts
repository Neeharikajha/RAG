import { Router } from "express";
import {
  scan,
  list,
  updateContradictionStatus,
} from "../controllers/contradictions.controller.js";

const router = Router();

router.post("/scan", scan);
router.get("/", list);
router.patch("/:id", updateContradictionStatus);

export default router;
