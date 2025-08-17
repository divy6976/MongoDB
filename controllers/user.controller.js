import User from "../model/User.model.js";
import crypto from "crypto"
import nodemailer  from "nodemailer"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const registerUser=async (req,res)=>{
    // take  name email password 
    //vaidate
    //check email exist or not 
    //if not make one
    //verification token (kisi or ki toh gmail nhi daal derhe)
    //send to db
    //send to user though url

    //sucees message

  const {name,email,password} =req.body

  if(!name || !email|| !password){
   return  res.status(400).json({
        message:"All fields  are required"

    })
  }

  try {
            const existingUser= await  User.findOne({email});

            if(existingUser){
              return  res.status(400).json({
                    message:"User already exist"
            
                })
            }                                                                                 
          
   
            const user = await User.create({
                name,
                email,
               
                password,
              });
              console.log(user);


              //token generate
              const token = crypto.randomBytes(32).toString("hex");
              console.log(token);

              //user ka strcutre update ab token dala
              user.verificationToken=token;
              //mongo db me update kre huye ko save;

              await user.save();
              

                       //token to send through url

               //send email
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false, // true for port 465, false for other ports
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });           

    const mailOption = {
      from: process.env.MAILTRAP_SENDEREMAIL,
      to: user.email,
      subject: "Verify your email", // Subject line
      text: `Please click on the following link:
      ${process.env.BASE_URL}/api/v1/users/verify/${token}             
      `,
    };

    await transporter.sendMail(mailOption);


       res.status(200).json({
        message:"User registered successfully",
        success:"true"


       })
          

              


  } catch (error) {
    res.status(201).json({
      message:"User not registered ",
      success:"true"


     })
        
    
  }

  
}

const verifyUser=async( req,res)=>{

  //get the token from url
  //validate
  //check token in db
  //if exist isverifed true,
  //if not
  //remove verificaion token
  //update db
  //suceess message

try {
  
  const {token}=req.params;

  if (!token) {
    return res.status(400).json({
      message: "Invalid token"
    });
  }
  
    const   user=   await    User.findOne({verificationToken:token})

    if(!user){
     return res.status(400).json({
        message:"User not verified"
      })
    }

    user.isVerified=true;
    user.verificationToken=null;
    await user.save()


    res.status(200).json({
      message:"user verified sucessfully",
      success:true
    })


} catch (error) {
  
  res.status(200).json({
    message:"user not verified ",
    error,
    success:false
  })


  
}


}


const login =async(req,res)=>{
  /// get email and password
  //check email exist or not
  // hashed wale pasword ko check with user password
  //session token

  //return suceess message

  try {
    const {email,password}=req.body;
    if(!email || !password){
     return  res.status(400).json({
          message:"All fields required"
      })
      
    }

   const user=await User.findOne({email});
   if(!user){
    res.status(400).json({
      message:"User not found"
  })
   }

   
   const isMatch=bcrypt.compare(password,user.password);
   if(!isMatch){
    res.status(400).json({
      message:"Invalid User or Password"
    });

    
   }
  
   console.log(isMatch);

   //jwt token session token bnanan hai aba
   //user se id nikalnege agar mongodb hai toh user._id krke nikalte 

    const token = jwt.sign(
      { id: user._id, role: user.role },

      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );
     //1st paramter      //paylaod isme data dete hai usally id hi lete hai
    // 2nd parameter- shhhh  ye scretert key process env me rkhte
    //3rd paramteer: expires in ye bhi env me jana chiaye 


    //cookie me token dal rhe 
    const cookieOptions = {
      httpOnly: true,   //true krne se backend ke control me agyi user ab ise ched chad nhi krstkan 
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    };
    res.cookie("token", token, cookieOptions);


    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });



    
  } catch (error) {
    res.status(404).json({
      message

    })
    
  }

}



// jb koi logout krrha profile use krrha forogot kr rha toh dekhna opdega authenticate hoga ya nhi\



// Activity	Token Check Hoga?	Kyu?
// 🔍 Profile dekhna	✅ Haan	Server ko confirm karna hai ki request kis user ne bheji hai
// 🔁 Logout karna	✅ Haan	Taaki server sahi user ka session expire kare
// 🔒 Password change	✅ Haan	Bahut sensitive action hai, toh valid token zaroori hai
// ❓ Forgot password (agar email se hai)	❌ Mostly nahi	Ye usually login se pehle hota hai, toh token ki zarurat nahi
// 🧾 Orders dekhna / update karna	✅ Haan	Token se hi pata chalega kaunsa user access kar raha hai


const getMe = async (req, res) => {
  

//login krte time token ke andr kuch info dali thi
//cookies se token niklunga 
//token me se data niklunga
  try {
    const user = await User.findById(req.user.id).select("-password");
    console.log(user);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("Error in get me", error);
  }
};




const logoutUser=async (req,res)=>{
  //session token  ko clear 
  //user logout
  try {
    res.cookie("token", "", {});
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {}

}

const forogotPassword=async (req,res)=>{
//get email
//vlidate
//check in db exist or not
//if exist then ek recoverytoken  genrate
//send in db
//url ke thorugh user ko send
//reset page khulega
//sucess message


const {email}=req.body;
if(!email){
return  res.status(400).json({
    message:"All Fields required",
    success:false

  })
}

try {
      const   user=    await User.findOne({email});
      if(!user){
        return  res.status(400).json({
    message:"User not found",
    success:false

  })
}
  

              const token = crypto.randomBytes(32).toString("hex");
              console.log(token);

               user.passwordResetToken=token;
               user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;

               await user.save();


                 const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false, // true for port 465, false for other ports
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });           

    const mailOption = {
      from: process.env.MAILTRAP_SENDEREMAIL,
      to: user.email,
      subject: "Verify your email", // Subject line
      text: `Please click on the following link:
      ${process.env.BASE_URL}/api/v1/users/reset/${token}             
      `,
    };

    await transporter.sendMail(mailOption);



res.status(200).json({
  message:"forgot ka kaam done",
  success:true
})






      } catch (error) {
         console.error("Error in forgotPassword:", error);
  return res.status(500).json({
    message: "Something went wrong",
    success: false
  });
  
}


}




const resetPassword=async (req,res)=>{
  //user ne frotend pe new pass likh dia
  // //collect token from params
    // password from req.body
    //check kro token match krta hai ki nhi and if match krta hai h toh token ki epxiiry check kro
    //if true then  user.password =password;
    //user.resetToken=null
    //token ko expire kro
    //save in databse
    //send krde sucess respoonse


    const {token}=req.params
    const {password}=req.body;

    try {
    const user=   await User.findOne({
            passwordResetToken:token,
                passwordResetExpiry:{$gt :Date.now()}


       })

if(!user){
  
 return res.status(400).json({
  message:"not valid user",
  success:false
})


}

user.password=password
user.passwordResetToken=undefined;
user.passwordResetExpiry=undefined;

await user.save();

 res.status(200).json({
  message:"Passowrd reset succesfully",
  success:true
 })

 





    } catch (error) {

      console.log(error)
       res.status(401).json({
  message:"Reset error",
  error,

  success:false
 })

      
    }





}











export {registerUser,verifyUser,login,getMe,logoutUser,resetPassword,forogotPassword};