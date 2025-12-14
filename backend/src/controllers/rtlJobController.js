import RtlJob from "../models/RtlJob.model.js";
import Project from "../models/Project.model.js";

export const createRTLJob = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { jobName, description } = req.body;

    if (!jobName) {
      return res.status(400).json({
        success: false,
        message: "Job name is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "RTL file is required",
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // ✅ REAL FILE PATH FROM MULTER
    const filePath = `uploads/rtl/${req.file.filename}`;


    const rtlJob = await RtlJob.create({
      project: projectId,
      user: req.user._id,
      jobName,
      filePath,
      description,
      status: "queued",
    });

    return res.status(201).json({
      success: true,
      data: rtlJob,
    });
  }  catch (error) {
        console.error("🔥 FULL ERROR OBJECT 🔥");
        console.error(error);
        console.error("🔥 STACK 🔥");
        console.error(error.stack);

        return res.status(500).json({
          success: false,
          message: error.message || "Unknown server error",
        });
  }

};

/* ===============================
   ✅ GET ALL RTL JOBS FOR PROJECT
================================ */
export const getRTLJobsForProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const jobs = await RtlJob.find({
      project: projectId,
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("Get RTL Jobs error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching RTL jobs",
    });
  }
};

/* ===============================
   ✅ GET SINGLE RTL JOB
================================ */
export const getSingleRTLJob = async (req, res) => {
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
        message: "Job not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Get Single RTL Job error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching RTL job",
    });
  }
};

/* ===============================
   ✅ UPDATE RTL JOB STATUS + LOGS
================================ */
export const updateRTLJobStatus = async (req, res) => {
  try {
    const { projectId, jobId } = req.params;
    const { status, statusMessage, logAppend } = req.body;

    const allowedStatuses = ["queued", "running", "success", "failed"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing status",
      });
    }

    const job = await RtlJob.findOne({
      _id: jobId,
      project: projectId,
      user: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // ✅ Set status
    job.status = status;

    if (statusMessage) job.statusMessage = statusMessage;

    // ✅ FIXED TYPO BUG: starteAt → startedAt
    if (status === "running" && !job.startedAt) {
      job.startedAt = new Date();
    }

    if ((status === "success" || status === "failed") && !job.finishedAt) {
      job.finishedAt = new Date();
    }

    // ✅ Append logs safely
    if (logAppend) {
      if (Array.isArray(logAppend)) {
        job.logs.push(...logAppend);
      } else if (typeof logAppend === "string") {
        job.logs.push(logAppend);
      }
    }

    await job.save();

    return res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Update RTL Job Status error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating RTL job status",
    });
  }
};
