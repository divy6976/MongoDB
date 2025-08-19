//middlware funcitonality hmesa routes me use hoti hia n
import jwt from "jsonwebtoken"


//cookies se token nikalo
//validate token

// us token konsecret wale key se match kro
//aur token me se data niklao jaise ye wale me user ki id hai




export const isLoggedIn = async (req, res, next) => {
  try {
    console.log(req.cookies);
    let token = req.cookies?.token;

    console.log("Token Found: ", token ? "YES" : "NO");

    if (!token) {
      console.log("NO token");
      return res.status(401).json({
        success: false,
        message: "Authentication failed",
      });
    }
//token se data niklana hai   //jis token se encrypt usi se decrypt fir isse payload niklate hai   //verify decode krke dega
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);       //ye verify bhi krlega and data bhi nikal lega
    console.log("decoded data: ", decoded);
    req.user = decoded;      /// suceess hua toh req.user milega
    next();
  } catch (error) {
    console.log("Auth middleware failure");
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      
    });
  }
  
};















export {isLoggedIn}