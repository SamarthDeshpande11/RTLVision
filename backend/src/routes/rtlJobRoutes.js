import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createRTLJob,getRTLJobsByProject } from "../controllers/rtlJobController.js";

const router = express.Router();

// ✅ CREATE RTL JOB FOR A PROJECT
router
    .route("/projects/:projectId/rtljobs")
    .post(protect, createRTLJob)
    .get(protect, getRTLJobsByProject);

export default router;
