import User from "../model/User.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

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

const verifyUser = async (req,res)=>{
  
}

export {registerUser, verifyUser}