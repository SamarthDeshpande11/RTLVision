import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import {connectDB} from "./src/config/db.js";
import healthRoutes from './src/routes/healthRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import projectRoutes from './src/routes/projectRoutes.js';
import rtlJobRoutes from './src/routes/rtlJobRoutes.js';
import simulationRoutes from "./src/routes/simulationRoutes.js";
import lintRoutes from "./src/routes/lintRoutes.js"

dotenv.config();

const app=express();
app.use(cors());
app.use(express.json());  
app.use("/api/health",healthRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/projects",projectRoutes);
app.use("/api/projects",lintRoutes);
app.use("/api/rtl-jobs",rtlJobRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/simulation", simulationRoutes);

app.get('/',(req,res)=>{
    res.send("RTLVision backend is running!!");
});

const PORT = 3000;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

