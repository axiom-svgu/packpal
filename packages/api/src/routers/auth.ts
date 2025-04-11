import { Router } from "express";
import type { RequestHandler } from "express";

const router = Router();

// Initiate registration by sending OTP
const registerHandler: RequestHandler = (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({
        message: "Email is required",
        success: false,
      });
      return;
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Initiate login by sending OTP
const loginHandler: RequestHandler = (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({
        message: "Email is required",
        success: false,
      });
      return;
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

router.post("/register", registerHandler);
router.post("/login", loginHandler);

export default router;
