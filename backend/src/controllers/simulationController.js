import RtlJob from "../models/RtlJob.model.js";

export const triggerRTLSimulation=async(req,res)=>{
    try {
        const{projectId,jobId}=req.params;

        const job=await RtlJob.findOne({
            _id:jobId,
            project:projectId,
            user:req.user._id,
        });
        if(!job){
            return res.status(404).json({
                success:false,
                message:"RTL job not found",
            });
        }

        if(job.status!=="queued"){
            return res.status(400).json({
                success:false,
                message:"Onl queued jobs can be simulated",
            });
        }
        job.status="running";
        job.startedAt=new Date();
        job.statusMessage="Simulation started";
        job.logs.push("🚀 Simulation triggered...");
        await job.save();

        setTimeout(async()=>{
            try {
                const updatedJob=await RtlJob.findById(jobId);

                updatedJob.logs.push("📄 RTL compilation successful...");
                updatedJob.logs.push("⚙️ Running testbench...");
                updatedJob.logs.push("✅ Simulation completed successfully!");

                updatedJob.status="success";
                updatedJob.finsihedAt=new Date();
                updatedJob.statusMessage="simulation passed";

                await updatedJob.save();
            } catch (error) {
                console.error("Simulation started successfully: ",err);
            }
        },5000);

        return res.status(200).json({
            success:true,
            message:"simulation triggered successfully",
            jobId:job._id,
        });
    } catch (error) {
        console.error("Trigger simulation error: ",error);
        return res.status(500).json({
            success:false,
            message:"Server error while triggering simulation",
        })
    }
}