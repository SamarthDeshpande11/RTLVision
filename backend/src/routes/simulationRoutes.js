import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { triggerRTLSimulation } from "../controllers/simulationController.js";

const router = express.Router();

router.post(
  "/:projectId/jobs/:jobId/simulate",
  protect,
  triggerRTLSimulation
);

export default router;
