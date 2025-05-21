import {Router} from "express";
import { registerUser,loginUser,logoutUser,getProfile,updateProfile } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import multer from "multer";
const userRouter=Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // temp folder to hold files before upload to Cloudinary
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // unique filename
  },
});
const uploads = multer({ storage });
userRouter.route("/register").post(
    uploads.fields([
        {
            name:"coverImage",
            maxCount:1
        }
    ])
    
    ,registerUser);
userRouter.post("/login", loginUser);

// Protected routes — requires user to be authenticated
userRouter.post("/logout", authenticate, logoutUser);
userRouter.get("/profile", authenticate, getProfile);

// Update profile with avatar and cover image upload (multiple files)
userRouter.put(
  "/profile",
  authenticate,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateProfile
);


export default userRouter;