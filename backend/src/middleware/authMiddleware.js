import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.model.js";

export const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.split(" ")[0].toLowerCase() === "bearer") {
      token = authHeader.split(" ")[1];

      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not set in environment variables");
        return res
          .status(500)
          .json({ message: "Server misconfiguration: missing JWT secret" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded JWT payload:", decoded);

      // Try multiple possible id fields
      const candidates = [decoded.id, decoded._id, decoded.userId].filter(Boolean);
      let user = null;

      for (const cid of candidates) {
        try {
          if (mongoose.Types.ObjectId.isValid(cid)) {
            user = await User.findById(cid).select("-password");
            if (user) break;
          }
        } catch (e) {
          // ignore and continue trying other candidates
        }
      }

      // fallback to email if present in token
      if (!user && decoded.email) {
        user = await User.findOne({ email: decoded.email }).select("-password");
      }

      if (!user) {
        console.error("Auth: user not found for decoded payload:", decoded);
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      return next();
    } else {
      return res.status(401).json({ message: "No token, access denied" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Token invalid", error: error.message });
  }
};