import mongoose from "mongoose";
import { DB_NAME } from "../src/constants.js";

const connectDB=async()=>{
    try{
        const connectinstance=await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`\n Connected to MongoDB:${connectinstance.connection.host}`);
    }
    catch(error)
    {
        console.log("Connection failed",error);
        process.exit(1)
    }
}

export default connectDB