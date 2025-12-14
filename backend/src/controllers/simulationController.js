import path from "path";
import fs from "fs";
import { exec } from "child_process";
import RtlJob from "../models/RtlJob.model.js";

export const triggerRTLSimulation = async (req, res) => {
  try {
    const { projectId, jobId } = req.params;

    /* -----------------------------
       1️⃣ Find RTL Job (Secure)
    ----------------------------- */
    const job = await RtlJob.findOne({
      _id: jobId,
      project: projectId,
      user: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "RTL Job not found",
      });
    }

    /* -----------------------------
       2️⃣ Resolve RTL File Path
       (IMPORTANT FIX)
    ----------------------------- */
    const rtlFilePath = path.join("/app", job.filePath);

    if (!fs.existsSync(rtlFilePath)) {
      job.status = "failed";
      job.statusMessage = "RTL file not found";
      job.logs.push(`❌ RTL file missing at ${rtlFilePath}`);
      job.finishedAt = new Date();
      await job.save();

      return res.status(400).json({
        success: false,
        message: "RTL file not found inside container",
      });
    }

    /* -----------------------------
       3️⃣ Prepare Runtime Folder
    ----------------------------- */
    const jobDir = path.join("/app/runtime_jobs", job._id.toString());
    fs.mkdirSync(jobDir, { recursive: true });

    const outputBinary = path.join(jobDir, "sim.out");
    const compileLog = path.join(jobDir, "compile.log");

    /* -----------------------------
       4️⃣ Reset Job State (NEW RUN)
    ----------------------------- */
    job.status = "running";
    job.statusMessage = "";
    job.logs = []; // 🔥 Clear old logs
    job.startedAt = new Date();
    job.finishedAt = null;
    job.logs.push("🚀 Simulation started");
    await job.save();

    /* -----------------------------
       5️⃣ REAL ICARUS COMMAND
    ----------------------------- */
    const compileCmd = `
      iverilog -o "${outputBinary}" "${rtlFilePath}" 2> "${compileLog}" &&
      vvp "${outputBinary}" >> "${compileLog}"
    `;

    /* -----------------------------
       6️⃣ Execute Simulation
    ----------------------------- */
    exec(compileCmd, async (error) => {
      const logContent = fs.existsSync(compileLog)
        ? fs.readFileSync(compileLog, "utf-8")
        : "";

      if (error) {
        job.status = "failed";
        job.statusMessage = "Compilation / Simulation failed";
        job.logs.push("❌ Simulation failed");
        job.logs.push(logContent || error.message);
        job.finishedAt = new Date();
        await job.save();
        return;
      }

      /* -----------------------------
         7️⃣ SUCCESS PATH
      ----------------------------- */
      job.status = "success";
      job.statusMessage = "Simulation completed successfully";
      job.logs.push("✅ Simulation completed successfully");
      if (logContent) job.logs.push(logContent);
      job.finishedAt = new Date();
      await job.save();
    });

    /* -----------------------------
       8️⃣ Immediate Response
    ----------------------------- */
    return res.status(200).json({
      success: true,
      message: "Simulation triggered",
      jobId: job._id,
    });
  } catch (err) {
    console.error("Simulation error:", err);
    return res.status(500).json({
      success: false,
      message: "Simulation trigger failed",
    });
  }
};
