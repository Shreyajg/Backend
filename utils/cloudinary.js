import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
 // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUDNAME, 
        api_key:process.env.CLOUDINARY_API_KEY, 
        api_secret:process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });
const uploadoncloud=async(localFilePath)=>{
    try {
        if(!localFilePath) return null

        const resp=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log("file has been uploaded successfully!",resp.url);
        return resp;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        console.log("ERROR:",error);
        return null
    }
}
export {uploadoncloud}