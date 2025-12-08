import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

{/* register */}

export const registerUser=async(req,res)=>{
    try {
        const{name,email,password}=req.body;

        //1.check user already exists
        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"User already exists"});
        }

        //2.hash password
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        //3.create user
        const user=await User.create({
            name,
            email,
            password:hashedPassword,
        });

        res.status(201).json({
            message:"User registered successfully",
            userId:user._id
        })
    } catch (error) {
        res.status(500).json({message:error.message});
    }
};

{/* login */}

export const loginUser=async(req,res)=>{
    try {
        const{email,password}=req.body;

        //1.check user exists
        const user=await User.findOne({email});
        if(!user) return res.status(404).json({message:"User not found"});


        //2.compare password
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch) return res.status(401).json({message:"Invalid credentials"});

        //3.generate jwt token
        const token=jwt.sign(
            {userId:user._id},
            process.env.JWT_SECRET,
            {expiresIn:"7d"}
        );
        res.status(200).json({
            message:"Login successful",
            token
        });
    } catch (error) {
        
    }
}