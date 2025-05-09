import User from "../model/User.model.js"
import crypto from "crypto"

export const registerUser = async (req,res)=>{
    // res.send("User Registered Successfully")

    const {name,email,password} = req.body
    if (!name || !email || !password){
        return res.status(400).json({
            message:"All fields are required"
        })
    }
    console.log(email)

    try {

        // User Validation
        const existingUser = await User.findOne({email})
        if (existingUser) {
            return res.status(400).json({
                message:"User already exists"
            })
        }

        const user = User.create({
            name,
            email,
            password
        })
        console.log(user)

        if (!user){
            return res.status(400).json({
                message:"User not registered"
             })
        }

        const token = crypto.randomBytes(32).toString("hex")
        console.log(token)
        user.verificationToken = token

        await user.save()


        // Sending Emails

        

    } catch (error) {
        
    }
}