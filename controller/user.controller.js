import User from "../model/User.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  // res.send("User Registered Successfully")

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    // User Validation
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
        success: false,
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });
    console.log(user);

    if (!user) {
      return res.status(400).json({
        message: "User not registered",
        success: false,
      });
    }

    // Token Generation

    const token = crypto.randomBytes(32).toString("hex");
    console.log(token);
    user.verificationToken = token;

    await user.save();

    // Sending Emails

    // const transporter = nodemailer.createTransport({
    //   host: process.env.MAILTRAP_HOST,
    //   port: process.env.MAILTRAP_PORT,
    //   secure: false, // true for 465, false for other ports
    //   auth: {
    //     user: process.env.MAILTRAP_USERNAME,
    //     pass: process.env.MAILTRAP_PASSWORD,
    //   },
    // });

    // const mailOptions = {
    //   from: process.env.MAILTRAP_SENDEREMAIL,
    //   to: user.email,
    //   subject: "Verify your email",
    //   text: `To verify click on the link below given
    //         ${process.env.BASE_URL}/api/v1/user/verify${token}`,
    // };

    // transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "User registered Successfully",
      success: true,
    });
  } catch (error) {
    console.error("Register User error:", error);

    res.status(500).json({  // <-- Use 500 here for server errors
      message: "Failed to register user, error occurred",
      error: error.message || error.toString(), // Only send message, not full error object
      success: false,
    });
  }
};

// Cohort code
// const registerUser = async (req, res) => {
//   //register user
//   const { name, email, password } = req.body;
//   if (!name || !email || !password) {
//     return res.status(400).json({
//       message: "All fields are required",
//     });
//   }
//   try {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({
//         message: "User already exists",
//       });
//     }
//     const user = await User.create({
//       name,
//       email,
//       password,
//     });

//     if (!user) {
//       return res.status(400).json({
//         message: "User not registered",
//         success: false,
//       });
//     }

//     //verification token, not jwt token
//     const token = crypto.randomBytes(32).toString("hex");
//     user.verificationToken = token;
//     await user.save();

//     //send verification email

//     // const transporter = nodemailer.createTransport({
//     //   host: process.env.MAILTRAP_HOST,
//     //   auth: {
//     //     user: process.env.MAILTRAP_USERNAME,
//     //     pass: process.env.MAILTRAP_PASSWORD,
//     //   },
//     // });
//     // const mailOptions = {
//     //   from: process.env.MAILTRAP_SENDER_EMAIL,
//     //   to: user.email,
//     //   subject: "Verify your email",
//     //   text: `Please click on the following link to verify your email: ${process.env.BASE_URL}/api/v1/users/verify/${token}`,
//     // };
//     // await transporter.sendMail(mailOptions);

//     res.status(200).json({
//       message: "User registered, check your email to verify",
//       success: true,
//     });
//   } catch (error) {
//     res.status(400).json({
//       message: "User not registered",
//       error,
//       success: false,
//     });
//   }
// };

const verifyUser = async (req, res) => {
  const { token } = req.params;
  console.log(token);
  if (!token) {
    return res.status(400).json({
      message: "Invalid token",
    });
  }

  const user = await User.findOne({ verificationToken: token });

  if (!user) {
    return res.status(400).json({
      message: "User not found Invalid token",
    });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "User is now verified",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "All field are required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User does not exists",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }
    const accessToken = jwt.sign({ id: user._id }, "shhhhh", {
      expiresIn: "5min",
    });
    const refreshAccessToken = jwt.sign({ id: user._id }, "nowShhhhh", {
      expiresIn: "24h",
    });

    user.refreshAccessToken = refreshAccessToken;

    await user.save();

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshAccessToken", refreshAccessToken, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(400).json({
      message: "fail to login",
      success: false,
      error: error,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -refreshAccessToken"
    );
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
    return res.status(400).json({
      success: false,
      message: "Unable to get user",
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const token = req.cookies?.refreshAccessToken;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const refreshDecoded = jwt.verify(token, "nowShhhhh");

    const user = await User.findOne({ _id: refreshDecoded.id });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    user.refreshAccessToken = null;
    await user.save();

    res.cookie("accessToken", "", { httpOnly: true, secure: true });
    res.cookie("refreshAccessToken", "", { httpOnly: true, secure: true });

    return res.status(200).json({
      success: true,
      message: "User logout successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Fail to logout user",
    });
  }
};

// const forgotPassword = async (req, res) => {
//   try {
//   } catch (error) {}
// };

// const resetPassword = async (req, res) => {
//   try {
//   } catch (error) {}
// };

export { registerUser, verifyUser, login, getProfile, logoutUser };
