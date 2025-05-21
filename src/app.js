import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from '../routes/user.routes.js';
import maidRouter from '../routes/maid.routes.js'; // ✅ Added import

const app = express();

try {
    app.use(cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }));

    app.use(express.json({ limit: "16kb" }));
    app.use(urlencoded({ extended: true, limit: "16kb" }));
    app.use(express.static("public"));
    app.use(cookieParser());

    // ✅ Routes
    app.use("/api/v1/user", userRouter);
    app.use("/api/v1/maid", maidRouter); // ✅ Added route

    app.on("error", (error) => {
        throw error;
    });

} catch (error) {
    console.log("Error", error);
}

export { app };
