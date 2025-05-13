import User from "../model/User.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const registerUser = async (req, res) => {
  // res.send("User Registered Successfully")

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }
  console.log(email);

  try {
    // User Validation
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
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
      });
    }

    // Token Generation

    const token = crypto.randomBytes(32).toString("hex");
    console.log(token);
    user.verificationToken = token;

    try {
      await user.save();
      console.log("User saved with token");
    } catch (error) {
      console.error("Error saving user:", err.message);
      return res
        .status(500)
        .json({ message: "Failed to save user", error: err.message });
    }

    // Sending Emails

    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.MAILTRAP_SENDEREMAIL,
      to: user.email,
      subject: "Verify your email",
      text: `To verify click on the link below given
            ${process.env.BASE_URL}/api/v1/user/verify${token}`,
    };

    transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "User registered Successfully",
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      message: "fail to register user, error occurred",
      error,
      success: false,
    });
  }
};

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
      message: "Invalid token",
    });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      message: "All field are required",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({
        message: "User does not exists",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ id: user._id }, "shhhhh", { expiresIn: "24h" });

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 24*60*60*1000,
    }

    res.cookieParser("token", token, cookieOptions)

    res.status(200).json({
      success: true,
      message:"Login successful",
      token,
      user:{
        id: user._id,
        name: user.name,
        role: user.role,
      }
    })
    

  } catch (error) {}
};

export { registerUser, verifyUser, login };
