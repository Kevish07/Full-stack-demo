import jwt from "jsonwebtoken";
import User from "../model/User.model.js";

export const isLoggedIn = async (req, res, next) => {
  try {
    // const token = req.cookies?.token
    const accessToken = req.cookies?.accessToken;
    const refreshAccessToken = req.cookies?.refreshAccessToken;

    if (!accessToken) {
      if (!refreshAccessToken) {
        console.log("kuch nhi hai")
        return res.status(400).json({
          success: false,
          message: "Access denied",
        });
      }
      console.log("refresh hai")
      const refreshDecoded = jwt.verify(refreshAccessToken, "nowShhhhh");

      const user = await User.findOne({_id: refreshDecoded.id});
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User does not exists",
        });
      }
    //   
    // 
      req.user = user

      const newAccessToken = jwt.sign({ id: user._id }, "shhhhh", {
        expiresIn: "5min",
      });
      const newRefreshAccessToken = jwt.sign({ id: user._id }, "nowShhhhh", {
        expiresIn: "24h",
      });

      user.refreshAccessToken = newRefreshAccessToken;
      await user.save();

      const cookieOptions = {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      };

      res.cookie("accessToken", newAccessToken, cookieOptions);
      res.cookie("refreshAccessToken", newRefreshAccessToken, cookieOptions);

      next();
    } else {
      const accessDecoded = jwt.verify(accessToken, "shhhhh");

      const user = await User.findOne({_id: accessDecoded.id});

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "User does not exists",
        });
      }
// 
// 
      req.user = user

      const newAccessToken = jwt.sign({ id: user._id }, "shhhhh", {
        expiresIn: "5min",
      });
      const newRefreshAccessToken = jwt.sign({ id: user._id }, "nowShhhhh", {
        expiresIn: "24h",
      });

      user.refreshAccessToken = newRefreshAccessToken;
      await user.save();

      const cookieOptions = {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      };

      res.cookie("accessToken", newAccessToken, cookieOptions);
      res.cookie("refreshAccessToken", newRefreshAccessToken, cookieOptions);

      next();
    }
  } catch (error) {
    console.log("Authentication Failure");
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
