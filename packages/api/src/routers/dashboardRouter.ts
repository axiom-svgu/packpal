import { Router } from "express";
import { db } from "../database";
import { authMiddleware } from "../middleware/auth";
import {
  users,
  groups,
  groupMembers,
  items,
  itemAssignments,
  lists,
} from "../database/schema";
import { eq, count, sql, desc, and } from "drizzle-orm";

export const dashboardRouter = Router();

// Middleware to authenticate all dashboard routes
dashboardRouter.use(authMiddleware);

// Get dashboard statistics
dashboardRouter.get("/stats", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get groups the user is a member of
    const userGroups = await db
      .select({
        groupId: groupMembers.groupId,
      })
      .from(groupMembers)
      .where(eq(groupMembers.userId, userId));

    const groupIds = userGroups.map((group) => group.groupId);

    if (groupIds.length === 0) {
      return res.json({
        success: true,
        data: {
          totalGroups: 0,
          totalLists: 0,
          itemsPacked: 0,
          itemsDelivered: 0,
          totalItems: 0,
        },
      });
    }

    // Get total number of groups
    const totalGroups = groupIds.length;

    // Get total number of lists
    const listsQuery = await db
      .select({ count: count() })
      .from(lists)
      .where(
        sql`${lists.groupId} IN (${sql.join(
          groupIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      );

    const totalLists = listsQuery[0]?.count || 0;

    // Get items statistics
    const itemsQuery = await db
      .select({ count: count() })
      .from(items)
      .where(
        sql`${items.groupId} IN (${sql.join(
          groupIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      );

    const totalItems = itemsQuery[0]?.count || 0;

    // Get packed items count
    const packedItemsQuery = await db
      .select({ count: count() })
      .from(itemAssignments)
      .where(
        and(
          sql`${itemAssignments.itemId} IN (
            SELECT ${items.id} FROM ${items} 
            WHERE ${items.groupId} IN (${sql.join(
            groupIds.map((id) => sql`${id}`),
            sql`, `
          )})
          )`,
          eq(itemAssignments.status, "packed")
        )
      );

    const itemsPacked = packedItemsQuery[0]?.count || 0;

    // Get delivered items count
    const deliveredItemsQuery = await db
      .select({ count: count() })
      .from(itemAssignments)
      .where(
        and(
          sql`${itemAssignments.itemId} IN (
            SELECT ${items.id} FROM ${items} 
            WHERE ${items.groupId} IN (${sql.join(
            groupIds.map((id) => sql`${id}`),
            sql`, `
          )})
          )`,
          eq(itemAssignments.status, "delivered")
        )
      );

    const itemsDelivered = deliveredItemsQuery[0]?.count || 0;

    res.json({
      success: true,
      data: {
        totalGroups,
        totalLists,
        itemsPacked,
        itemsDelivered,
        totalItems,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
});

// Get packing progress by group
dashboardRouter.get("/packing-progress", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get groups the user is a member of
    const userGroups = await db
      .select({
        groupId: groupMembers.groupId,
        group: groups.name,
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(eq(groupMembers.userId, userId))
      .limit(5);

    if (userGroups.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const progressData = await Promise.all(
      userGroups.map(async (group) => {
        // Get total items in the group
        const totalItemsQuery = await db
          .select({ count: count() })
          .from(items)
          .where(eq(items.groupId, group.groupId));

        const totalItems = totalItemsQuery[0]?.count || 0;

        if (totalItems === 0) {
          return {
            groupName: group.group,
            percentPacked: 0,
          };
        }

        // Get packed and delivered items
        const packedItemsQuery = await db
          .select({ count: count() })
          .from(itemAssignments)
          .where(
            and(
              sql`${itemAssignments.itemId} IN (
              SELECT ${items.id} FROM ${items} 
              WHERE ${items.groupId} = ${group.groupId}
            )`,
              sql`${itemAssignments.status} IN ('packed', 'delivered')`
            )
          );

        const packedItems = packedItemsQuery[0]?.count || 0;
        const percentPacked = Math.round((packedItems / totalItems) * 100);

        return {
          groupName: group.group,
          percentPacked,
        };
      })
    );

    res.json({
      success: true,
      data: progressData,
    });
  } catch (error) {
    console.error("Error fetching packing progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch packing progress",
    });
  }
});

// Get recent activity
dashboardRouter.get("/recent-activity", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get groups the user is a member of
    const userGroups = await db
      .select({
        groupId: groupMembers.groupId,
      })
      .from(groupMembers)
      .where(eq(groupMembers.userId, userId));

    const groupIds = userGroups.map((group) => group.groupId);

    if (groupIds.length === 0) {
      return res.json({
        success: true,
        data: [],
      });
    }

    // Get recent item assignments (packing activity)
    const recentAssignments = await db
      .select({
        id: itemAssignments.id,
        status: itemAssignments.status,
        updatedAt: itemAssignments.updatedAt,
        itemName: items.name,
        userName: users.name,
        groupName: groups.name,
      })
      .from(itemAssignments)
      .innerJoin(items, eq(itemAssignments.itemId, items.id))
      .innerJoin(users, eq(itemAssignments.assignedTo, users.id))
      .innerJoin(groups, eq(items.groupId, groups.id))
      .where(
        sql`${items.groupId} IN (${sql.join(
          groupIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      )
      .orderBy(desc(itemAssignments.updatedAt))
      .limit(5);

    const activityData = recentAssignments.map((activity) => {
      let activityType = "updated";
      if (activity.status === "packed") {
        activityType = "packed";
      } else if (activity.status === "delivered") {
        activityType = "delivered";
      }

      return {
        id: activity.id,
        title: `${activity.itemName} ${activityType}`,
        group: activity.groupName,
        user: activity.userName,
        time: activity.updatedAt,
        type: activity.status,
      };
    });

    res.json({
      success: true,
      data: activityData,
    });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent activity",
    });
  }
});
