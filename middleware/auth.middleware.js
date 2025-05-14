import jwt from "jsonwebtoken"

export const isLoggedIn = async (req,res,next)=>{
    try {
        console.log(res.cookies)
        const token = res.cookies?.token

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

    next()
}