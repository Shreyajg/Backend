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

export { registerMaid };
