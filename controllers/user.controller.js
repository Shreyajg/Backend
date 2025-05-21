import { ApiError } from '../utils/apierror.js';
import {asyncHandler} from '../utils/ayncHandler.js';
import { User } from '../Models/user.models.js'
import ApiResponse from "../utils/ApiResponse.js";
import { uploadoncloud } from '../utils/cloudinary.js';
const registerUser=asyncHandler(async (req,res)=>{
    const {fullname,username,email,password}=req.body
    console.log("Email",email);
    if([fullname,email,username,password].some((field)=>field?.trim()===" ")){
        throw  new ApiError(400,"all  fields are required");
    }

    const existinguser=await User.findOne({
        $or:[{email},{username}]
    })
    if(existinguser)
    {
        throw new ApiError(409,"User with email or username already exits");
    }

    const coverImageLocalPath=req.files?.coverImage[0].path;
    if(!coverImageLocalPath)
    {
        throw new ApiError(400,"coverImage is a required File");
    }
    const coverImage=await uploadoncloud(coverImageLocalPath);
    if(!coverImage)
    {
        throw new ApiError(400,"coverImage is a required File");
    }

    const user=await User.create({
        fullname,
        coverimage:coverImage?.url || "",
        email,
        password,
        username
    })

    const userid=await User.findById(user._id).select("-password -refreshtoken");

    if(!userid)
    {
        throw new ApiError(500,"something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200,userid,"user registered successfully")
    )


})
export {registerUser};