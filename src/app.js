import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"
const app=express();
try{
    app.use(cors({
        originp:process.env.CORS_ORIGIN,
        credentials:true
    }))
    app.on("error",(error)=>{
        
        throw error
    })
}
catch(error){
   console.log("Error",error);
}
export {app}