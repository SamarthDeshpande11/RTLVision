import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { downloadWaveform, triggerRTLSimulation } from "../controllers/simulationController.js";

const router = express.Router();

router.post(
  "/:projectId/jobs/:jobId/simulate",
  protect,
  triggerRTLSimulation
);
router.get(
  "/:projectId/jobs/:jobId/waveform",
  protect,
  downloadWaveform
)

export default router;
