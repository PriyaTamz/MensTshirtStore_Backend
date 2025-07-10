import User from "../Model/User.js";
import jwt from "jsonwebtoken";
import axios from "axios";

const JWT_SECRET = "apple";

export const userRegister = async (req, res) => {
  try {
    const { firstName, lastName, phone, email } = req.body;

    // Validation
    if (!firstName || !lastName || !phone || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const existingPhoneUser = await User.findOne({ phone });
    if (existingPhoneUser) {
      return res.status(400).json({ message: "Phone number already exists" });
    }

    const newUser = new User({
      firstName,
      lastName,
      phone,
      email,
      role: "user",
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const requestOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    // Basic validation
    if (!phone) {
      return res
        .status(400)
        .json({ message: "Phone and password are required" });
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    const user = await User.findOne({ phone, role: "user" });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid credentials or not an admin" });
    }

    // Send OTP via 2Factor
    const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${phone}/AUTOGEN`
    );

    if (response.data.Status !== "Success") {
      return res.status(500).json({ message: "OTP send failed" });
    }

    // Save session ID to verify later
    user.otpSession = response.data.Details;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    res
      .status(200)
      .json({
        message: "OTP sent successfully",
        sessionId: response.data.Details,
      });
  } catch (error) {
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required" });
    }

    const user = await User.findOne({ phone });
    if (!user || !user.otpSession) {
      return res
        .status(404)
        .json({ message: "Session not found. Please request OTP again." });
    }

    if (user.otpExpires < new Date()) {
      return res
        .status(401)
        .json({ message: "OTP expired. Please request a new one." });
    }

    const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/VERIFY/${user.otpSession}/${otp}`
    );

    if (response.data.Status !== "Success") {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    user.otpSession = null;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      id: user._id,
      phone: user.phone,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

export const userLogout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};
