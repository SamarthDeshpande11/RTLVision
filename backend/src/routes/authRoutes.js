import express from "express";
import { registerUser,loginUser } from "../controllers/authController.js";

const router = express.Router();

// ✅ Test route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth route is working ✅",
  });
});
router.post("/register",registerUser);
router.post("/login",loginUser);

export default router;
