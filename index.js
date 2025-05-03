import express from "express"
import dotenv from "dotenv"
import cors from "cors"


dotenv.config()

const app = express()

app.use(cors({
    origin:"http://localhost:3000",
    credentials: true,
    methods:["GET","PUT","DELETE","OPTIONS"],
    allowedHeaders:["Content-Type, Authorization"],
}))

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
