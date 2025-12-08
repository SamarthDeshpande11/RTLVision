import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import {connectDB} from "./src/config/db.js";
import healthRoutes from './src/routes/healthRoutes.js';

dotenv.config();

const app=express();
app.use(cors());
app.use(express.json());  
app.use("/api/health",healthRoutes);

app.get('/',(req,res)=>{
    res.send("RTLVision backend is running!!");
});

const PORT = 3000;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

