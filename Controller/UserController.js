import User from "../Model/User.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "apple";

// Helper function for phone validation
const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Helper function for email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const userRegister = async (req, res) => {
  try {
    const { firstName, lastName, phone, email } = req.body;

    // Validation
    if (!firstName || !lastName || !phone || !email) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid phone number format (10 digits required)" 
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid email format" 
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "User with this email or phone already exists" 
      });
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      phone,
      email,
      role: "user",
      isVerified: false,
    });

    await newUser.save();

    // Send OTP via SMS
    const otpResponse = await sendOtpViaSms(newUser.phone);
    if (!otpResponse.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP via SMS"
      });
    }

    // Save OTP session
    newUser.otpSession = otpResponse.sessionId;
    newUser.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
    await newUser.save();

    res.status(201).json({ 
      success: true,
      message: "Registration successful. OTP sent via SMS.",
      data: {
        userId: newUser._id,
        sessionId: otpResponse.sessionId
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server error: " + error.message 
    });
  }
};

export const requestOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ 
        success: false,
        message: "Phone number is required" 
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid phone number format" 
      });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Send OTP via SMS
    const otpResponse = await sendOtpViaSms(user.phone);
    if (!otpResponse.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP via SMS"
      });
    }

    // Save OTP session
    user.otpSession = otpResponse.sessionId;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP sent via SMS successfully",
      data: {
        sessionId: otpResponse.sessionId
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server error: " + error.message 
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, userId } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ 
        success: false,
        message: "Phone and OTP are required" 
      });
    }

    let user;
    if (userId) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne({ phone });
    }

    if (!user || !user.otpSession) {
      return res.status(404).json({ 
        success: false,
        message: "OTP session not found" 
      });
    }

    if (user.otpExpires < new Date()) {
      return res.status(401).json({ 
        success: false,
        message: "OTP expired" 
      });
    }

    // Verify OTP with 2Factor
    const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/VERIFY/${user.otpSession}/${otp}`
    );

    if (response.data.Status !== "Success") {
      return res.status(401).json({ 
        success: false,
        message: "Invalid OTP" 
      });
    }

    // Update user status
    user.otpSession = null;
    user.otpExpires = null;
    if (userId) user.isVerified = true;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        isVerified: user.isVerified
      }, 
      JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE || "1d" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server error: " + error.message 
    });
  }
};

export const userLogout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });

    res.status(200).json({ 
      success: true,
      message: "Logged out successfully" 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Logout failed: " + error.message 
    });
  }
};

export const checkAuthStatus = async (req, res) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(200).json({ 
        success: false,
        isAuthenticated: false 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(200).json({ 
        success: false,
        isAuthenticated: false 
      });
    }

    res.status(200).json({
      success: true,
      isAuthenticated: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    });

  } catch (error) {
    res.status(200).json({ 
      success: false,
      isAuthenticated: false 
    });
  }
};

async function sendOtpViaSms(phone) {
  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${phone}/AUTOGEN`
    );

    if (response.data.Status !== "Success") {
      console.error("Failed to send OTP via SMS:", response.data);
      return { success: false };
    }

    return {
      success: true,
      sessionId: response.data.Details
    };

  } catch (error) {
    console.error("Error sending OTP via SMS:", error.message);
    return { success: false };
  }
}

/*
async function sendOtpViaSms(phone) {
  try {  
    const response = await axios.get(
      `https://2factor.in/API/V1/${process.env.TWO_FACTOR_API_KEY}/SMS/${phone}/AUTOGEN`
    );

    if (response.data.Status !== "Success") {
      console.error("Failed to send OTP via SMS:", response.data);
      return { success: false };
    }

    return {
      success: true,
      sessionId: response.data.Details
    };

  } catch (error) {
    console.error("Error sending OTP via SMS:", error.message);
    return { success: false };
  }
}
*/
