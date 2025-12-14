import fs from "fs";
import path from "path";
import { exec } from "child_process";
import RtlJob from "../models/RtlJob.model.js";

export const triggerRTLSimulation = async (req, res) => {
  try {
    const { projectId, jobId } = req.params;
    console.log("Trigger simulation for projectId:", projectId, "jobId:", jobId, "user:", req.user._id);

    const job = await RtlJob.findOne({
      _id: jobId,
      project: projectId,
      user: req.user._id,
    });

    if (!job) {
      console.log("Job not found");
      return res.status(404).json({
        success: false,
        message: "RTL Job not found",
      });
    }

    console.log("Job found:", job._id, "designPath:", job.designPath, "testbenchPath:", job.testbenchPath);

    // Backward compatibility: if old job has filePath instead of designPath
    if (!job.designPath && job.filePath) {
      job.designPath = job.filePath;
      job.testbenchPath = job.filePath; // Assuming single file, but adjust if needed
    }

    // 🔒 Validate required files
    if (!job.designPath || !job.testbenchPath) {
      console.log("Missing designPath or testbenchPath");
      return res.status(400).json({
        success: false,
        message: "Design file or testbench file missing",
      });
    }

    // Absolute paths INSIDE container
    const designPath = path.join("/app", job.designPath);
    const testbenchPath = path.join("/app", job.testbenchPath);

    console.log("Absolute designPath:", designPath, "exists:", fs.existsSync(designPath));
    console.log("Absolute testbenchPath:", testbenchPath, "exists:", fs.existsSync(testbenchPath));

    if (!fs.existsSync(designPath) || !fs.existsSync(testbenchPath)) {
      job.status = "failed";
      job.statusMessage = "RTL files not found inside container";
      job.logs.push(`❌ Missing files: ${designPath} or ${testbenchPath}`);
      job.finishedAt = new Date();
      await job.save();

      return res.status(400).json({
        success: false,
        message: "RTL file not found inside container",
      });
    }

    // Runtime directory for this job
    const runtimeDir = path.join("/app/runtime_jobs", job._id.toString());
    console.log("Creating runtime dir:", runtimeDir);
    fs.mkdirSync(runtimeDir, { recursive: true });

    const simBinary = path.join(runtimeDir, "sim.out");
    const waveformPath = path.join(runtimeDir, "waveform.vcd");

    console.log("Sim binary:", simBinary, "Waveform path:", waveformPath);

    // Update job → running
    job.status = "running";
    job.statusMessage = "Simulation running";
    job.startedAt = new Date();
    job.logs.push("🚀 Simulation started");
    console.log("Saving job to running status");
    await job.save();
    console.log("Job saved to running");

    /**
     * REAL ICARUS VERILOG FLOW
     * - Compile design + testbench
     * - Run simulation
     * - Testbench generates waveform.vcd
     */
    const cmd = `
      iverilog -g2012 -o ${simBinary} ${designPath} ${testbenchPath} &&
      vvp ${simBinary}
    `;

    console.log("Design path:", designPath);
    console.log("Testbench path:", testbenchPath);
    console.log("Files exist:", fs.existsSync(designPath), fs.existsSync(testbenchPath));
    console.log("Runtime dir:", runtimeDir);
    console.log("Sim binary:", simBinary);
    console.log("Command:", cmd.trim());

    exec(cmd, { timeout: 60000 }, async (error, stdout, stderr) => {
      try {
        console.log("Exec result - error:", !!error, "stdout length:", stdout?.length, "stderr length:", stderr?.length);
        if (error) {
          console.log("Simulation error details:", error.message);
          console.log("Stderr:", stderr);
          job.status = "failed";
          job.statusMessage = "Compilation / Simulation failed";
          job.logs.push("❌ Simulation failed");
          job.logs.push(stderr || error.message);
          job.finishedAt = new Date();
          await job.save();
          return;
        }

        // Success
        console.log("Simulation success");
        job.status = "success";
        job.statusMessage = "Simulation completed successfully";
        job.logs.push("✅ Simulation completed successfully");
        job.waveformPath = `runtime_jobs/${job._id}/waveform.vcd`;
        job.finishedAt = new Date();
        await job.save();
      } catch (err) {
        console.error("Error updating job status:", err);
      }
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
