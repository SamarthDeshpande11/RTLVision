import { exec } from "child_process";
import path from "path";
import fs from "fs";
import LintJob from "../models/LintJob.model.js";

export const runRTLLint = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { designPath } = req.body;

    if (!designPath) {
      return res.status(400).json({
        success: false,
        message: "designPath is required",
      });
    }

    const absDesignPath = path.join("/app", designPath);

    if (!fs.existsSync(absDesignPath)) {
      return res.status(400).json({
        success: false,
        message: "RTL file not found",
      });
    }

    // 1️⃣ Create lint job FIRST
    const lintJob = await LintJob.create({
      user: req.user._id,
      project: projectId,
      designPath,
      status: "running",
      findings: [],
      summary: { critical: 0, warning: 0, info: 0 },
    });

    const lintJobId = lintJob._id;

    // 2️⃣ Build lint commands
    const iverilogCmd = `iverilog -Wall ${absDesignPath}`;
    const verilatorCmd = `verilator --lint-only ${absDesignPath}`;

    // 3️⃣ Run lint async
    exec(`${iverilogCmd} 2>&1; ${verilatorCmd} 2>&1`, async (error, stdout, stderr) => {
      const output = `${stdout || ""}\n${stderr || ""}`;
      const findings = [];

      /* =========================
         LATCH DETECTION
      ========================= */
      if (/latch/i.test(output)) {
        findings.push({
          ruleId: "RTL-LATCH-001",
          severity: "CRITICAL",
          message: "Unintended latch inferred",
          explanation:
            "Combinational logic does not assign outputs in all branches.",
          fix:
            "Ensure all conditional paths assign a value or use clocked logic.",
        });
      }

      /* =========================
         BASIC CDC DETECTION
      ========================= */
      if (/clock.*used.*data/i.test(output)) {
        findings.push({
          ruleId: "RTL-CDC-001",
          severity: "CRITICAL",
          message: "Clock signal used as data",
          explanation:
            "Clock used as data causes metastability across domains.",
          fix:
            "Use proper CDC synchronizers or handshake logic.",
        });
      }

      const summary = {
        critical: findings.filter(f => f.severity === "CRITICAL").length,
        warning: findings.filter(f => f.severity === "WARNING").length,
        info: findings.filter(f => f.severity === "INFO").length,
      };

      // 4️⃣ SAFE UPDATE (no stale object)
      await LintJob.findByIdAndUpdate(lintJobId, {
        status: "success",
        findings,
        summary,
      });
    });

    // 5️⃣ Immediate response (non-blocking)
    return res.status(200).json({
      success: true,
      message: "Lint job started",
      lintJobId,
    });
  } catch (err) {
    console.error("Lint error:", err);
    return res.status(500).json({
      success: false,
      message: "RTL lint failed",
    });
  }
};
