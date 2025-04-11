import express from "express";
import { adminAuthMiddleware } from "../middleware/auth";

const router = express.Router();

// Initiate registration by sending OTP
router.post("/register", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        success: false,
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
});

// Verify OTP and complete registration/login
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
        success: false,
      });
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
});

// Initiate login by sending OTP
router.post("/login", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        success: false,
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
});

// Create admin user (protected by admin middleware)
router.post("/create-admin", adminAuthMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        success: false,
      });
    }
  } catch (error) {
    console.error("Admin creation error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
});

export default router;
