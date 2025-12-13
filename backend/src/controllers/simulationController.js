import fs from "fs";
import path from "path";
import { exec } from "child_process";
import RtlJob from "../models/RtlJob.model.js";

export const triggerRTLSimulation = async (req, res) => {
  try {
    const { projectId, jobId } = req.params;

    const job = await RtlJob.findOne({
      _id: jobId,
      project: projectId,
      user: req.user._id,
    });

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Update status → running
    job.status = "running";
    job.startedAt = new Date();
    job.logs.push("🚀 Simulation started");
    await job.save();

    // Paths
    const runtimeDir = path.join("runtime_jobs", jobId);
    const rtlSource = path.join(runtimeDir, "design.v");
    const outputFile = path.join(runtimeDir, "sim.out");

    // Ensure runtime directory exists
    fs.mkdirSync(runtimeDir, { recursive: true });

    // Copy uploaded RTL file into runtime folder
    fs.copyFileSync(job.filePath, rtlSource);

    // Compile + simulate
    const compileCmd = `iverilog -o ${outputFile} ${rtlSource}`;
    const runCmd = `vvp ${outputFile}`;

    exec(`${compileCmd} && ${runCmd}`, async (error, stdout, stderr) => {
      if (error || stderr) {
        job.status = "failed";
        job.statusMessage = "Simulation failed";
        job.logs.push(stderr || error.message);
        job.finishedAt = new Date();
        await job.save();
        return;
      }

      job.status = "success";
      job.statusMessage = "Simulation completed successfully";
      job.logs.push(stdout || "Simulation completed");
      job.finishedAt = new Date();
      await job.save();
    });

    return res.status(200).json({
      success: true,
      message: "Simulation triggered successfully",
      jobId,
    });

  } catch (err) {
    console.error("Simulation error:", err);
    return res.status(500).json({
      success: false,
      message: "Simulation trigger failed",
    });
  }
};
