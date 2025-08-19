import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import db from "./utils/db.js"
import cookieParser from 'cookie-parser'

// import all routes

import userRoutes from './routes/user.routes.js'


b

dotenv.config()

const app = express()   //express ki sari shaktiyan ko use karke ek app bana raha hu



const port = process.env.PORT || 4000;

app.use(
    cors({
      origin: process.env.BASE_URL,
      credentials: true,
      methods: ["GET", "POST", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json()); // ise backend me  json object ko accept karne me help karega
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())  // user ki cookies acees kr skte hai

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.get('/divy',(req,res)=>{
    res.send("Hello World")
});

app.get("/hitesh",(req,res)=>{
    res.send('hi');

           


});

// Connect to database
db();



//user routes 
app.use("/api/v1/users", userRoutes);








app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});



