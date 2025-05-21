import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "../DB/index.js"; // ✅ import the existing app, don't create a new one

dotenv.config({ path: './.env' });

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`🚀 Server is running at http://localhost:${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => {
    console.error("❌ Connection failed:", err);
  });
