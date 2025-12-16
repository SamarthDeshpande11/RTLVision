import mongoose from "mongoose";

const lintFindingSchema=new mongoose.Schema({
    ruleId:String,
    severity:{
        type:String,
        enum:["INFO","WARNING","CRITICAL"],
    },
    message:String,
    file:String,
    line:Number,
    explanation:String,
    fix:String,
});
const lintJobSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    project:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Project",
        required:true,
    },
    designPath:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        enum:["queued","running","success","failed"],
        default:"queued",
    },
    findings:[lintFindingSchema],
    summary:{
        critical:Number,
        warning:Number,
        info:Number,
    },
},{timestamps:true});

export default mongoose.model("LintJob",lintJobSchema);