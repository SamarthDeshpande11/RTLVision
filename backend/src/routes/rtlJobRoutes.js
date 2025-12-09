import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createRTLJob,getRTLJobsForProject,getSingleRTLJob,updateRTLJobStatus } from '../controllers/rtlJobController.js';

const router=express.Router();

router
    .route("/:projectId/jobs")
    .post(protect,createRTLJob)
    .get(protect,getRTLJobsForProject);

router 
    .route("/:projectId/jobs/:jobId")
    .get(protect,getSingleRTLJob);

router  
    .route("/:projectId/jobs/:jobId/status")
    .patch(protect,updateRTLJobStatus);

export default router;
