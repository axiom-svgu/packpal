import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import constants from "../utils/constants";
import { GroupRole } from "../database/schema";
import { JWT_SECRET } from "../utils/constants";
import { db } from "../database";
import { groupMembers } from "../database/schema";
import { and, eq } from "drizzle-orm";

// Define role hierarchy
const roleHierarchy: Record<GroupRole, number> = {
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

// Check if user is a member of the group with minimum required role
export const requireGroupRole = (groupId: string, requiredRole: GroupRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authenticatedReq = req;
    const user = authenticatedReq.user;

    if (!user) {
      return res.status(401).json({
        message: "Authentication required",
        success: false,
      });
    }

    try {
      // Find the user's role in the specified group
      const membership = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, user.id)
        ),
      });

      if (!membership) {
        return res.status(403).json({
          message: "You are not a member of this group",
          success: false,
        });
      }

      if (roleHierarchy[membership.role] < roleHierarchy[requiredRole]) {
        return res.status(403).json({
          message: "Insufficient permissions in this group",
          success: false,
        });
      }

      next();
    } catch (error) {
      console.error("Group role check error:", error);
      return res.status(500).json({
        message: "Internal server error",
        success: false,
      });
    }
  };
};

// The following functions are kept for backward compatibility but will be deprecated
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
    };

    // Skip the role check since we no longer have user roles
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }
};

// These middleware functions will be deprecated in favor of requireGroupRole
export const requireRole = (requiredRole: GroupRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // We don't check roles at the user level anymore
    next();
  };
};

export const requireAnyRole = (requiredRoles: GroupRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // We don't check roles at the user level anymore
    next();
  };
};
