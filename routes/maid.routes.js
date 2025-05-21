import {Router} from "express";
import { registerMaid,loginMaid,searchMaids,logoutMaid,getProfile,updateProfile } from "../controllers/maid.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import multer from "multer";
import { authenticate } from "../middleware/auth.middleware.js";
const maidRouter=Router();
// Multer setup for handling avatar and coverImage file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const uploads = multer({ storage });
maidRouter.route("/register").post(
     uploads.fields([
            {
                name:"coverImage",
                maxCount:1
            }
        ])
    ,registerMaid);
maidRouter.post("/login", loginMaid);
maidRouter.get("/search", searchMaids);
maidRouter.post("/logout", authenticate, logoutMaid);
maidRouter.get("/profile", authenticate, getProfile);
maidRouter.put(
  "/profile",
  authenticate,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateProfile
);

export default maidRouter;