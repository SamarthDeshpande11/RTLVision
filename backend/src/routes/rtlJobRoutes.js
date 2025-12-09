import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createRTLJob } from "../controllers/rtlJobController.js";

const router = express.Router();

// ✅ CREATE RTL JOB FOR A PROJECT
router.post("/:projectId/jobs", protect, createRTLJob);

export default router;
