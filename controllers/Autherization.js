import jwt from "jsonwebtoken";
import User from "../models/users";

const sendTokenCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, 
  });
};


export const signup = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name  !email  !password)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });

    if (password.length < 8)
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 8 characters.",
        });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(409)
        .json({ success: false, message: "Email already registered." });

    const user = await User.create({ full_name, email, password });

    res.status(201).json({
      success: true,
      message: "Account created! Please log in.",
      user: { id: user._id, full_name: user.full_name, email: user.email },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error during signup." });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });

    sendTokenCookie(res, user._id);

    res.status(200).json({
      success: true,
      message: "Logged in successfully!",
      user: { id: user._id, full_name: user.full_name, email: user.email },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error during login." });
  }
};


export const logout = (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ success: true, message: "Logged out successfully." });
};