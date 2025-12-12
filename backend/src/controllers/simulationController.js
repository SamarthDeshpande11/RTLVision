// src/controllers/simulationController.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import RtlJob from "../models/RtlJob.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// base workdir where job-specific dirs will be created
const JOBS_BASE_DIR = path.join(__dirname, "../../runtime_jobs");

// ensure base exists
if (!fs.existsSync(JOBS_BASE_DIR)) {
  fs.mkdirSync(JOBS_BASE_DIR, { recursive: true });
}

/**
 * Helper: run a command with streaming stdout/stderr, timeout (ms).
 * Returns a promise that resolves {code, signal}.
 * Appends output via appendLog callback (line-by-line).
 */
function runCommand(cmd, args, opts = {}) {
  const { cwd, timeout = 60_000, appendLog } = opts;

  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { cwd, shell: false });

    let stdoutBuf = "";
    let stderrBuf = "";
    let finished = false;

    // collect stdout
    proc.stdout.on("data", (chunk) => {
      const s = chunk.toString();
      stdoutBuf += s;
      // forward lines to appendLog
      s.split(/\r?\n/).forEach((ln) => {
        if (ln && typeof appendLog === "function") appendLog(ln);
      });
    });

    // collect stderr
    proc.stderr.on("data", (chunk) => {
      const s = chunk.toString();
      stderrBuf += s;
      s.split(/\r?\n/).forEach((ln) => {
        if (ln && typeof appendLog === "function") appendLog("[ERR] " + ln);
      });
    });

    proc.on("error", (err) => {
      if (finished) return;
      finished = true;
      reject(err);
    });

    proc.on("close", (code, signal) => {
      if (finished) return;
      finished = true;
      resolve({ code, signal, stdout: stdoutBuf, stderr: stderrBuf });
    });

    // Timeout kill
    const timer = setTimeout(() => {
      if (finished) return;
      finished = true;
      try {
        proc.kill("SIGKILL");
      } catch (e) {}
      if (typeof appendLog === "function") {
        appendLog("[SYSTEM] Simulation timed out and was killed.");
      }
      resolve({ code: null, signal: "SIGKILL", stdout: stdoutBuf, stderr: stderrBuf });
    }, timeout);

    // clear timer on finish
    proc.on("close", () => clearTimeout(timer));
  });
}

/**
 * Trigger a real iverilog simulation for a job.
 * Expects job.filePath to point to the uploaded RTL file (absolute or relative to project).
 * This API will:
 * - create working dir for job
 * - copy uploaded file(s) into it (or symlink)
 * - run iverilog to compile: iverilog -o sim_out <filename>
 * - run vvp sim_out
 * - stream logs into job.logs
 * - update job.status, startedAt, finishedAt, statusMessage
 *
 * NOTE: For multi-file projects / libs you'd extend to copy all required files.
 */
export const triggerRTLSimulation = async (req, res) => {
  try {
    const { projectId, jobId } = req.params;

    const job = await RtlJob.findOne({
      _id: jobId,
      project: projectId,
      user: req.user._id,
    });

    if (!job) {
      return res.status(404).json({ success: false, message: "RTL job not found" });
    }

    if (job.status !== "queued") {
      return res.status(400).json({ success: false, message: "Only queued jobs can be simulated" });
    }

    // filePath in your DB looks like "/uploads/xxxxx.v" or "uploads/xxx.v"
    // Convert to absolute path on disk
    const uploadRel = job.filePath.startsWith("/") ? job.filePath.slice(1) : job.filePath;
    const uploadAbs = path.join(process.cwd(), uploadRel); // assuming server root

    if (!fs.existsSync(uploadAbs)) {
      return res.status(400).json({ success: false, message: "Uploaded RTL file not found on disk" });
    }

    // create job-specific working dir
    const workdir = path.join(JOBS_BASE_DIR, String(job._id));
    if (!fs.existsSync(workdir)) fs.mkdirSync(workdir, { recursive: true });

    // copy the uploaded file into workdir for isolated run (avoid modifying upload dir)
    const originalFilename = path.basename(uploadAbs);
    const workFilePath = path.join(workdir, originalFilename);
    fs.copyFileSync(uploadAbs, workFilePath);

    // update job -> running
    job.status = "running";
    job.startedAt = new Date();
    job.statusMessage = "Simulation started (iverilog)";
    job.logs = job.logs || [];
    job.logs.push("🚀 Simulation triggered (iverilog)...");
    await job.save();

    // helper to append log + persist periodically
    const appendLog = async (text) => {
      try {
        job.logs.push(String(text));
        // persist small batches to DB — we keep it simple: save immediately
        // In heavy load, buffer writes
        await job.save();
      } catch (err) {
        console.error("Failed to append log:", err);
      }
    };

    // 1) compile: iverilog -o sim_out <file>
    await appendLog(`📌 Compiling ${originalFilename} with iverilog...`);

    // run iverilog
    const compileResult = await runCommand(
      "iverilog",
      ["-o", "sim_out", originalFilename],
      { cwd: workdir, timeout: 30_000, appendLog }
    );

    if (compileResult.code !== 0) {
      // compilation failed
      job.status = "failed";
      job.finishedAt = new Date();
      job.statusMessage = "Compilation failed";
      job.logs.push("[COMPILATION FAILED]");
      job.logs.push(compileResult.stderr || compileResult.stdout || "No compiler output");
      await job.save();
      return res.status(200).json({ success: true, message: "Simulation completed (compilation failed)", jobId: job._id });
    }

    await appendLog("📄 Compilation OK. Running simulation via vvp...");

    // 2) run: vvp sim_out
    const runResult = await runCommand("vvp", ["sim_out"], { cwd: workdir, timeout: 60_000, appendLog });

    // check run exit
    if (runResult.code !== 0) {
      job.status = "failed";
      job.finishedAt = new Date();
      job.statusMessage = "Runtime error";
      job.logs.push("[RUNTIME ERROR]");
      if (runResult.stderr) job.logs.push(runResult.stderr);
      if (runResult.stdout) job.logs.push(runResult.stdout);
      await job.save();
      return res.status(200).json({ success: true, message: "Simulation completed (runtime failed)", jobId: job._id });
    }

    // success
    job.status = "success";
    job.finishedAt = new Date();
    job.statusMessage = "Simulation passed";
    job.logs.push("✅ Simulation completed successfully!");
    await job.save();

    // optional: move generated files (vcd, sim_out) into uploads or artifacts folder
    // you can copy `${workdir}/sim_out` or any .vcd files to a persistent artifacts directory

    return res.status(200).json({ success: true, message: "Simulation completed successfully", jobId: job._id });
  } catch (error) {
    console.error("Trigger simulation error:", error);
    // try to mark job failed safely (best effort)
    try {
      if (typeof job !== "undefined" && job) {
        job.status = "failed";
        job.statusMessage = "Internal simulation error";
        job.logs = job.logs || [];
        job.logs.push("[SYSTEM] Internal simulation error: " + (error.message || String(error)));
        job.finishedAt = new Date();
        await job.save();
      }
    } catch (e) {
      console.error("Failed to mark job failed:", e);
    }
    return res.status(500).json({ success: false, message: "Server error while running simulation" });
  }
};
