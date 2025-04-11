import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import constants from "../utils/constants";
import { UserRole } from "../database/schema";
import { JWT_SECRET } from "../utils/constants";

// Define role hierarchy
const roleHierarchy: Record<UserRole, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

// Middleware to verify JWT token
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
        success: false,
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: UserRole;
    };

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
      success: false,
    });
  }
};

export const adminAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }

  try {
    const decoded = jwt.verify(token, constants.JWT_SECRET) as {
      id: string;
      email: string;
      role: UserRole;
    };

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden", success: false });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }
};

// Middleware to check if user has required role
export const requireRole = (requiredRole: UserRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
      return res.status(403).json({
        message: "Insufficient permissions",
        success: false,
      });
    }

    next();
  };
};

// Middleware to check if user has at least one of the required roles
export const requireAnyRole = (requiredRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    if (!requiredRoles.includes(user.role)) {
      return res.status(403).json({
        message: "Insufficient permissions",
        success: false,
      });
    }

    next();
  };
};
