import mongoose from "mongoose"
import bcrypt from "bcrypt"



const userSchema=new mongoose.Schema({       //yaha pr structure bnaya 
    name:String,
    email:String,
    password:String,
    role: {
        type: String,
        enum: ["user", "admin"],   // enum mtlb inmse se hi choose kro aur jabhi enum use tb default set kro
                                         
        default: "user",
      },
    isVerified:{
   type:Boolean,
   default:false
    },
      verificationToken:{
type:String
      },
    passwordResetToken:{
        type:String
    },
    passwordResetExpiry:{
        type:Date
    }

    



},{  timestamps: true})

// ek likhe  h next jaise hi next call mtlb apna kaam hogya hai

userSchema.pre("save",async function(next){
  if(this.isModified('password')){
    this.password= await bcrypt.hash(this.password,10);

  }
  

  next();
})


const User=mongoose.model("User",userSchema);    //yaha pr structure ko databse me dala

export  default User;


//get email pass
//check email exist or not
// if exist then check passs
//if matched generate session token thorugh jwt
// send to db
// send to user cookies 
//suceess message



