import mongoose from "mongoose";
export const db_connection = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");
    }
    catch(error){
        console.log("Database connection failed",error);
    }
}