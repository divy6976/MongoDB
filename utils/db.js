import mongoose from 'mongoose';
import dotenv from "dotenv"

dotenv.config()



const connectDB = ()=>{
    mongoose.connect(process.env.MONGO_URL)
    .then(()=>{
        console.log("mongodb connected")
    })
    .catch((err)=>{
        console.log(" err in connecting")
    })
}
  


export default connectDB;




