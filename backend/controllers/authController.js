import User from "../models/userModel.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import bcrypt from "bcryptjs";



export const signup = async (req, res) => {
    try {
        const {email, fullName, password} = req.body;
        if(!email || !fullName || !password) {
            return res.status(400).json({message: "Please fill all the fields"});
        }

        if(password.length < 6) {
            return res.status(400).json({message: "Password must be at least 6 characters long"});
        }

        const user = await User.findOne({email});
        if(user) {
            return res.status(400).json({message: "User already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            fullName,
            password: hashedPassword,
        });

        if(newUser) {
            generateToken(newUser._id, res);

            await newUser.save();
 
            res.status(201).json({message: "User created successfully"});
        }
        else {
            res.status(400).json({message: "Invalid user data"});
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error"});
    }
}


export const login = async(req, res) => {
    try {
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(400).json({message:"Please fill all the fields"});
        }

        const user = await User.findOne({email});

        // if(user && (await bcrypt.compare(password, user.password))) {
        //     generateToken(user._id, res);
        //     res.status(200).json({message: "Login successful"});
        // }
        // else {
        //     res.status(401).json({message: "Invalid email or password"});
        // }

        if(!user) {
            return res.status(401).json({message: "Invalid email or user doesnot exist"});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(401).json({message: "Invalid password"});
        }

        generateToken(user._id, res);
        res.status(200).json({message: "Login successful"});
        
    }
    catch (error) {
        console.error(error);
        res.status(500).json({message: "Server error"});
    }
}

export const logout = (req,res)=> {
   try {
    res.cookie("jwt", "", {maxAge: 0});
    res.status(200).json({message: "Logout successful"});
   } 
   catch (error) {
    console.log("Error in logout:", error);
    res.status(500).json({message: "Server error"});
   }
}


export const updateProfile = async (req, res) => {
    try {
        const {profilePic} = req.body;

        const userId = req.user._id;
        
        if(!profilePic) {
            return res.status(400).json({message: "Profile picture is required"});
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic)

        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {new: true}).select("-password");

        if(!updatedUser) {
            return res.status(404).json({message: "User not found"}); 
        }

        res.status(200).json({message: "Profile updated successfully", user: updatedUser});
    }

    catch (error) {
        console.log("Error in updateProfile:", error);
        res.status(500).json({message: "Server error"});
    }
}


export const checkAuth = (req, res) => {
    try {
        res.status(200).json({message: "Authenticated", user: req.user});
    }
    catch (error) {
        console.log("Error in checkAuth:", error.message); 
        res.status(500).json({message: "Server error"});
    }
}