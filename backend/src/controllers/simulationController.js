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
      return res.status(404).json({
        success: false,
        message: "RTL Job not found",
      });
    }

    // Validate paths
    if (!job.designPath || !job.testbenchPath) {
      return res.status(400).json({
        success: false,
        message: "Design file or testbench file missing",
      });
    }

    const designPath = path.join("/app", job.designPath);
    const testbenchPath = path.join("/app", job.testbenchPath);

    if (!fs.existsSync(designPath) || !fs.existsSync(testbenchPath)) {
      job.status = "failed";
      job.statusMessage = "RTL files not found inside container";
      job.logs.push("❌ RTL files missing inside container");
      job.finishedAt = new Date();
      await job.save();

      return res.status(400).json({
        success: false,
        message: "RTL file not found inside container",
      });
    }

    // Create isolated runtime directory
    const runtimeDir = path.join("/app/runtime_jobs", job._id.toString());
    fs.mkdirSync(runtimeDir, { recursive: true });

    // Update job → running
    job.status = "running";
    job.statusMessage = "Simulation running";
    job.startedAt = new Date();
    job.logs.push("🚀 Simulation started");
    await job.save();

    /**
     * ✅ CRITICAL FIX:
     * Run BOTH iverilog and vvp INSIDE runtimeDir
     */
    const tbModuleName = "demo_tb"; // later store this in DB
    const cmd = `
      iverilog -g2012 -s ${tbModuleName} -o ${simBinary} ${designPath} ${testbenchPath} &&
      vvp ${simBinary}
    `;


    exec(
      cmd,
      {
      cwd: runtimeDir,   // 🔥 THIS IS THE FIX
      timeout: 60000,
      },
      async (error, stdout, stderr) => {

      if (error) {
        job.status = "failed";
        job.statusMessage = "Compilation / Simulation failed";
        job.logs.push("❌ Simulation failed");
        job.logs.push(stderr || error.message);
        job.finishedAt = new Date();
        await job.save();
        return;
      }

      // Success
      job.status = "success";
      job.statusMessage = "Simulation completed successfully";
      job.logs.push("✅ Simulation completed successfully");
      job.waveformPath = `runtime_jobs/${job._id}/waveform.vcd`;
      job.finishedAt = new Date();
      await job.save();
    });

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
export const downloadWaveform = async (req, res) => {
  try {
    const { projectId, jobId } = req.params;

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

    if (!job.waveformPath) {
      return res.status(404).json({
        success: false,
        message: "Waveform not generated for this job",
      });
    }

    const absoluteWaveformPath = path.join("/app", job.waveformPath);

    if (!fs.existsSync(absoluteWaveformPath)) {
      return res.status(404).json({
        success: false,
        message: "Waveform file missing on server",
      });
    }

    // Stream file
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=waveform-${jobId}.vcd`
    );

    fs.createReadStream(absoluteWaveformPath).pipe(res);
  } catch (error) {
    console.error("Waveform download error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to download waveform",
    });
  }
};
