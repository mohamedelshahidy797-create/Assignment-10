import mongoose from "mongoose";
import { DB_URI } from "./config.js";
import dns from 'node:dns' 
import { userModel } from "./model/user.model.js";
import { connectRadis } from "./redis.connection.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

export const bootstrapDB= async(app , port)=>{
    try {
        await mongoose.connect(DB_URI , {serverSelectionTimeoutMS:5000})
         await userModel.syncIndexes()
        console.log(`DB connected successfully ❤️`);
        await connectRadis()
        app.listen(port , ()=> console.log(`example app is working on port ${port}`));
        
        
    } catch (error) {
        console.log(error);
        
        console.log(`fail to connect to DB ❌`);
        
    }
}