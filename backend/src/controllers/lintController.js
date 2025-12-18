import { exec } from "child_process";
import path from "path";
import fs from "fs";
import LintJob from "../models/LintJob.model.js";
import { runLintRules } from "../lint/ruleEngine.js";
import blockingRule from "../lint/rules/blocking.rule.js";
import combRule from "../lint/rules/comb.rule.js";
import resetRule from "../lint/rules/reset.rule.js";
import fsmRule from "../lint/rules/fsm.rule.js";
import driverRule from "../lint/rules/drivers.rule.js";
import latchRule from "../lint/rules/latch.rule.js";

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

    /* =============================
       1️⃣ CREATE LINT JOB
    ============================= */
    const lintJob = await LintJob.create({
      user: req.user._id,
      project: projectId,
      designPath,
      status: "running",
      findings: [],
      summary: { critical: 0, warning: 0, info: 0 },
    });

    const lintJobId = lintJob._id;

    /* =============================
       2️⃣ RUN CUSTOM RULE ENGINE
    ============================= */
    const rules = [
      blockingRule,
      combRule,
      resetRule,
      fsmRule,
      driverRule,
      latchRule,
    ];

    const ruleFindings = runLintRules(absDesignPath, rules);

    console.log("Rule findings:", ruleFindings);

    /* =============================
       3️⃣ RUN TOOL-BASED LINT
    ============================= */
    const iverilogCmd = `iverilog -Wall ${absDesignPath}`;
    const verilatorCmd = `verilator --lint-only ${absDesignPath}`;

    exec(
      `iverilog -Wall ${absDesignPath} 2>&1`,
      async (error, stdout, stderr) => {
        const output = `${stdout || ""}\n${stderr || ""}`;
        console.log("Tool output:", output);
        const toolFindings = [];

        /* LATCH (tool-based) */
        if (/latch/i.test(output)) {
          toolFindings.push({
            ruleId: "RTL-LATCH-TOOL-001",
            severity: "CRITICAL",
            message: "Latch inferred (tool)",
            explanation: "Tool detected unintended latch inference.",
            fix: "Ensure full assignment in combinational logic.",
          });
        }

        /* CDC heuristic */
        if (/clock.*used.*data/i.test(output)) {
          toolFindings.push({
            ruleId: "RTL-CDC-001",
            severity: "CRITICAL",
            message: "Clock used as data",
            explanation: "Clock used as data causes CDC issues.",
            fix: "Use proper synchronizers or CDC logic.",
          });
        }

        /* General warnings */
        if (/warning/i.test(output)) {
          toolFindings.push({
            ruleId: "RTL-WARNING-001",
            severity: "WARNING",
            message: "General warning from tool",
            explanation: output,
            fix: "Review the warning message.",
          });
        }

        const allFindings = [...ruleFindings, ...toolFindings];

        console.log("All findings:", allFindings);
        console.log("Summary:", summary);

        await LintJob.findByIdAndUpdate(lintJobId, {
          status: "success",
          findings: allFindings,
          summary,
        });
      }
    );

    /* =============================
       4️⃣ IMMEDIATE RESPONSE
    ============================= */
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

/* =============================
   ✅ GET LINT JOB
================================ */
export const getLintJob = async (req, res) => {
  try {
    const { projectId, lintJobId } = req.params;
    console.log("Get lint job:", projectId, lintJobId, "user:", req.user._id);

    const lintJob = await LintJob.findOne({
      _id: lintJobId,
      project: projectId,
      user: req.user._id,
    });

    console.log("Found lint job:", !!lintJob);

    if (!lintJob) {
      return res.status(404).json({
        success: false,
        message: "Lint job not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: lintJob,
    });
  } catch (error) {
    console.error("Get Lint Job error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching lint job",
    });
  }
};
