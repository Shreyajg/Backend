import dotenv from "dotenv";
import connectDB from "../DB/index.js"; // also make sure to add `.js` if you're using ES Modules

dotenv.config({ path: './.env' }); // ✅ make sure this matches your file name

connectDB();
then(()=>{
    app.listen(process.nextTick.PORT || 8000,()=>{
            console.log(`server is running at ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("connection failed",err);
})
