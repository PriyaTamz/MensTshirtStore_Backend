import Admin from "../Model/Admin.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Register a new admin
export const adminRegister = async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;

    if (!username || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      username,
      password: hashedPassword,
      role: "admin", // Explicitly set role to 'admin'
    });

    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login an admin
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Find the user and ensure they have the 'admin' role
    const admin = await Admin.findOne({ username, role: "admin" });

    if (!admin) {
      return res.status(404).json({ message: "Invalid credentials or not an admin" });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET, // Use secret from .env file
      {
        expiresIn: "1d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: "None", // Necessary for cross-origin requests
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      message: "Login successful",
      token: token,
      role: admin.role,
      username: admin.username,
      id: admin._id,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Logout an admin
export const adminLogout = async (req, res) => {
  try {
    // Clear the cookie
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0), // Set expiry to a past date
      secure: process.env.NODE_ENV === 'production', // Must match login settings
      sameSite: "None", // Must match login settings
    });

    res.status(200).json({ message: "Admin logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};


