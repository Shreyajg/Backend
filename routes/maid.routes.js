import {Router} from "express";
import { registerMaid } from "../controllers/maid.controller.js";
import { upload } from "../middleware/multer.middleware.js";
const maidRouter=Router();
maidRouter.route("/register").post(
     upload.fields([
            {
                name:"coverImage",
                maxCount:1
            }
        ])
    ,registerMaid);

export default maidRouter;