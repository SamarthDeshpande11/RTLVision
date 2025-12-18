import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import {runRTLLint, getLintJob} from "../controllers/lintController.js";

const router=express.Router();
router.post(
    "/:projectId/lint",
    protect,
    runRTLLint
);
router.get(
    "/:projectId/lint/:lintJobId",
    protect,
    getLintJob
);
export default router;