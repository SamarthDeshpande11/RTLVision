import express from "express";
import {
  createProject,
  getProjects,
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, createProject)   // ✅ POST = Create project
  .get(protect, getProjects);     // ✅ GET = Fetch projects

export default router;
