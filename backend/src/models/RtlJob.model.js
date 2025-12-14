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
    },

    description: {
      type: String,
    },

    // ✅ uploaded file paths
    designPath: {
      type: String,
      required: true,
    },

    testbenchPath: {
      type: String,
      required: true,
    },

    // ✅ simulation outputs
    waveformPath: {
      type: String,
    },

    status: {
      type: String,
      enum: ["queued", "running", "success", "failed"],
      default: "queued",
    },

    statusMessage: {
      type: String,
      default: "",
    },

    logs: {
      type: [String],
      default: [],
    },

    startedAt: Date,
    finishedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("RtlJob", rtlJobSchema);
