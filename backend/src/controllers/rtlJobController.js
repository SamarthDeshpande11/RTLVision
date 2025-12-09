import RtlJobModel from "../models/RtlJob.model.js";

export const createRTLJob = async (req, res) => {
  try {
    const { jobName, filePath, description } = req.body;
    const { projectId } = req.params;

    // ✅ VALIDATION
    if (!jobName || !filePath) {
      return res.status(400).json({
        success: false,
        message: "Job name and file path are required",
      });
    }

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // ✅ CREATE RTL JOB
    const rtlJob = await RtlJobModel.create({
      user: req.user._id,     // comes from auth middleware
      project: projectId,    // comes from URL param
      jobName,
      filePath,
      description,
    });

    return res.status(201).json({
      success: true,
      data: rtlJob,
    });

  } catch (error) {
    console.error("Create RTL Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating RTL job",
    });
  }
};

export const getRTLJobsByProject=async(req,res)=>{
    try {
        const {projectId}=req.params;

        const jobs=await RtlJobModel.find({
            project:projectId,
            user:req.user._id,
        }).sort({createdAt:-1});

        res.status(200).json({
            success:true,
            count:jobs.length,
            data:jobs,
        });
    } catch (error) {
        console.error("Get RTL Jobs error: ",error);
        res.status(500).json({
            success:false,
            message:"Server error while fetching RTL jobs",
        });
    }
};