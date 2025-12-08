import express from 'express';
const Router=express.Router();
Router.get('/',(req,res)=>{
    res.json({
        status:"ok",
        message:"RTLVision API is running"
    });
});
export default Router;
