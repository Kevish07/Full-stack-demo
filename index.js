import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./utils/db.js"
import cookieParser from "cookie-parser"

// Routes import
import UserRoutes from "./routes/user.routes.js"

dotenv.config()

const app = express()

app.use(
  cors({
    origin: "http://localhost:5173", // Match your frontend URL exactly
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Set-Cookie", "*"],
  })
);
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send('Home')
})

app.get("/dashboard",(req,res)=>{
    res.send("Welcome to dashboard")
})

app.get("/setting",(req,res)=>{
    res.send("Welcome to setting")
})

connectDB()

app.use("/api/v1/user", UserRoutes)

app.listen(4000, () => {
  console.log(`Example app listening on port 4000`)
})
