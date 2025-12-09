import mongoose from "mongoose";

const rtlJobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    jobName: {
      type: String,
      required: true,
      trim: true,
    },

    filePath: {
      type: String,
      required: true,
      trim:true,
    },

    description: {
      type: String,
      default: "",
    },
    originalFileName:{
      type:String,
    },
    status: {
      type: String,
      enum: ["queued","running","success","failed"],
      default: "queued",
    },
    statusMessage:{
        type:String,
        default:"",
    },
    startedAt:{
        type:Date,
    },
    finsihedAt:{
        type:Date,
    },
    logs:[
        {
            type:String,
        },
    ],
  },
  { timestamps: true }
);

const RtlJob = mongoose.model("RtlJob", rtlJobSchema);
export default RtlJob;
