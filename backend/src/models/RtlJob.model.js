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
    },

    description: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const RtlJobModel = mongoose.model("RtlJob", rtlJobSchema);
export default RtlJobModel;
