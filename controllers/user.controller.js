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
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (![email, password].every(Boolean)) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "Invalid credentials");

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token in DB (optional)
  user.refreshtoken = refreshToken;
  await user.save();

  // Set refresh token as cookie (optional)
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json(new ApiResponse(200, { accessToken }, "Login successful"));
});

// Logout user
const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  user.refreshtoken = null;
  await user.save();

  res.clearCookie("refreshToken");
  res.json(new ApiResponse(200, null, "Logout successful"));
});

// Get user profile
const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select("-password -refreshtoken");
  if (!user) throw new ApiError(404, "User not found");

  res.json(new ApiResponse(200, user, "User profile fetched"));
});

// Update user profile with avatar and cover image upload
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const { fullname, username, email } = req.body;
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  // Upload avatar and coverImage if provided
  if (req.files?.avatar?.length) {
    const avatarUpload = await uploadOnCloud(req.files.avatar[0].path);
    if (!avatarUpload) throw new ApiError(500, "Avatar upload failed");
    user.avatar = avatarUpload.secure_url;
  }
  if (req.files?.coverImage?.length) {
    const coverUpload = await uploadOnCloud(req.files.coverImage[0].path);
    if (!coverUpload) throw new ApiError(500, "Cover image upload failed");
    user.coverimage = coverUpload.secure_url;
  }

  // Update other fields if provided
  if (fullname) user.fullname = fullname;
  if (username) user.username = username;
  if (email) user.email = email;

  await user.save();

  const updatedUser = await User.findById(userId).select("-password -refreshtoken");

  res.json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
};