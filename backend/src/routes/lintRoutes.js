import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import {runRTLLint} from "../controllers/lintController.js";

const router=express.Router();
router.post(
    "/:projectId/lint",
    protect,
    runRTLLint
);
export default router;