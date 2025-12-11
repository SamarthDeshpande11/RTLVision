import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { rtlUpload } from "../config/multer.js";

import {
  createRTLJob,
  getRTLJobsForProject,
  getSingleRTLJob,
  updateRTLJobStatus,
} from "../controllers/rtlJobController.js";
import { triggerRTLSimulation } from "../controllers/simulationController.js";


const router = express.Router();


router.post(
  "/:projectId/jobs",
  protect,
  rtlUpload.single("rtlFile"),
  createRTLJob
);


router.get(
  "/:projectId/jobs",
  protect,
  getRTLJobsForProject
);


router.get(
  "/:projectId/jobs/:jobId",
  protect,
  getSingleRTLJob
);


router.patch(
  "/:projectId/jobs/:jobId/status",
  protect,
  updateRTLJobStatus
);

router.post(
  "/:projectId/jobs/:jobId/simulate",
  protect,
  triggerRTLSimulation
);
export default router;
