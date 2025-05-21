import { ApiError } from '../utils/apierror.js';
import { asyncHandler } from '../utils/ayncHandler.js';
import { Maid } from '../Models/maid.models.js';
import ApiResponse from "../utils/ApiResponse.js";
import { uploadoncloud } from '../utils/cloudinary.js';


const registerMaid = asyncHandler(async (req, res) => {
    const { fullname, username, email, password } = req.body;

    if ([fullname, email, username, password].some(field => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existingMaid = await Maid.findOne({
        $or: [{ email }, { username }]
    });

    if (existingMaid) {
        throw new ApiError(409, "Maid with email or username already exists");
    }
    const coverImageLocalPath=req.files?.coverImage[0].path;
        if(!coverImageLocalPath)
        {
            throw new ApiError(400,"Avatar is a required File");
        }
        const coverImage=await uploadoncloud(coverImageLocalPath);
        if(!coverImage)
        {
            throw new ApiError(400,"Avatar is a required File");
        }

    const maid = await Maid.create({
        fullname,
        coverImage:coverImage?.url || "",
        email,
        password,
        username
    });

    const maidData = await Maid.findById(maid._id).select("-password -refreshtoken");

    if (!maidData) {
        throw new ApiError(500, "Something went wrong while registering the Maid");
    }

    return res.status(201).json(
        new ApiResponse(200, maidData, "Maid registered successfully")
    );
});


const loginMaid = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    throw new ApiError(400, "Email and password are required");
  }

  const maid = await Maid.findOne({ email });
  if (!maid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isValid = await maid.isPasswordCorrect(password);
  if (!isValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = maid.generateAccessToken();
  const refreshToken = maid.generateRefreshToken();

  maid.refreshtoken = refreshToken;
  await maid.save({ validateBeforeSave: false });

  const maidData = await Maid.findById(maid._id).select("-password -refreshtoken");

  res.status(200).json(
    new ApiResponse(200, {
      maid: maidData,
      accessToken,
      refreshToken,
    }, "Login successful")
  );
});

// -------------------------
// Search Maids
// -------------------------
const searchMaids = asyncHandler(async (req, res) => {
  const query = req.query.q?.trim();

  if (!query) {
    throw new ApiError(400, "Search query is required");
  }

  const results = await Maid.find({
    $or: [
      { fullname: { $regex: query, $options: "i" } },
      { username: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } }
    ]
  }).select("-password -refreshtoken");

  res.status(200).json(new ApiResponse(200, results, "Search results"));
});
const logoutMaid = asyncHandler(async (req, res) => {
    await Maid.findByIdAndUpdate(req.user._id, { $unset: { refreshtoken: 1 } });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json(new ApiResponse(200, null, "Logout successful"));
});

// Get Profile
const getProfile = asyncHandler(async (req, res) => {
    const maid = await Maid.findById(req.user._id).select("-password -refreshtoken");
    if (!maid) throw new ApiError(404, "User not found");

    return res.status(200).json(new ApiResponse(200, maid));
});

// Update Profile
const updateProfile = asyncHandler(async (req, res) => {
    const { fullname, username } = req.body;
    const maid = await Maid.findById(req.user._id);
    if (!maid) throw new ApiError(404, "Maid not found");

    if (fullname) maid.fullname = fullname;
    if (username) maid.username = username;

    if (req.files?.avatar) {
        const avatarRes = await uploadoncloud(req.files.avatar[0].path);
        if (avatarRes?.url) maid.avatar = avatarRes.url;
    }

    if (req.files?.coverImage) {
        const coverRes = await uploadoncloud(req.files.coverImage[0].path);
        if (coverRes?.url) maid.coverimage = coverRes.url;
    }

    await maid.save();

    return res.status(200).json(new ApiResponse(200, maid, "Profile updated"));
});


export {
  registerMaid,
  loginMaid,
  searchMaids,
  logoutMaid,
  getProfile,
  updateProfile
};
