import jwt from "jsonwebtoken"

export const isLoggedIn = async (req,res,next)=>{
    try {
        console.log(req.cookies)
        const token = req.cookies?.token
        console.log(token)
        const decoded = jwt.verify(token,"shhhhh")
        req.user = decoded

        next()
    } catch (error) {
        console.log("Authentication Failure")
        res.status(500).json({
            message:"Internal server error",
            success: false,
        })
    }
}