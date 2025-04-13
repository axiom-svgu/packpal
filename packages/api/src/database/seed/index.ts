import { faker } from "@faker-js/faker";
import {
  generateId,
  generateUserData,
  getRandomItem,
  getRandomItems,
  hashPassword,
  randomDate,
} from "./utils";
import { db, schema } from "../index";

// Group role type
type GroupRole = "owner" | "admin" | "member" | "viewer";

// Item status type
type ItemStatus = "to_pack" | "packed" | "delivered";

// Seed configurations
const SEED_CONFIG = {
  USERS: 20,
  GROUPS: 8,
  MEMBERS_PER_GROUP: 4,
  CATEGORIES_PER_GROUP: 3,
  ITEMS_PER_CATEGORY: 5,
  ITEM_ASSIGNMENTS_PER_ITEM: 2,
  LISTS_PER_GROUP: 2,
  ITEMS_PER_LIST: 6,
  ASSIGNMENTS_PER_LIST_ITEM: 1,
};

// Indian names in English
const INDIAN_NAMES = [
  "Aarav Patel",
  "Aditi Sharma",
  "Arjun Singh",
  "Diya Gupta",
  "Ishaan Kumar",
  "Kavya Reddy",
  "Rohan Malhotra",
  "Saanvi Joshi",
  "Vihaan Mehta",
  "Zara Khan",
  "Ayaan Verma",
  "Anaya Choudhary",
  "Dhruv Agarwal",
  "Ira Mishra",
  "Kabir Saxena",
  "Maya Desai",
  "Reyansh Kapoor",
  "Sara Khanna",
  "Vivaan Bhatia",
  "Zoya Malhotra",
];

// Admin user for testing
const ADMIN_USER = {
  id: generateId(),
  name: "Admin User",
  email: "admin@example.com",
  password: "password123",
};

// Travel-related group names
const TRAVEL_GROUP_NAMES = [
  "Goa Beach Trip",
  "Himalayan Trek",
  "Kerala Backwaters",
  "Rajasthan Heritage",
  "Ladakh Adventure",
  "Andaman Islands",
  "North East Explorer",
  "South India Tour",
];

// Travel-related categories
const TRAVEL_CATEGORIES = [
  "Clothing & Accessories",
  "Toiletries & Personal Care",
  "Electronics & Gadgets",
  "Travel Documents",
  "Medicines & First Aid",
  "Snacks & Food",
  "Camping Gear",
  "Photography Equipment",
];

// Travel-related items
const TRAVEL_ITEMS = [
  // Travel Documents
  { name: "Passport & Visa", category: "Travel Documents" },
  { name: "Travel Insurance", category: "Travel Documents" },
  { name: "Flight Tickets", category: "Travel Documents" },
  { name: "Hotel Reservations", category: "Travel Documents" },
  { name: "Travel Itinerary", category: "Travel Documents" },

  // Clothing & Accessories
  { name: "Hiking Boots", category: "Clothing & Accessories" },
  { name: "Rain Jacket", category: "Clothing & Accessories" },
  { name: "Swimwear", category: "Clothing & Accessories" },
  { name: "Sunglasses", category: "Clothing & Accessories" },
  { name: "Warm Jacket", category: "Clothing & Accessories" },
  { name: "Comfortable Shoes", category: "Clothing & Accessories" },
  { name: "Hat/Cap", category: "Clothing & Accessories" },
  { name: "Scarf/Shawl", category: "Clothing & Accessories" },

  // Toiletries & Personal Care
  { name: "Sunscreen SPF 50", category: "Toiletries & Personal Care" },
  { name: "Insect Repellent", category: "Toiletries & Personal Care" },
  { name: "Toothbrush & Toothpaste", category: "Toiletries & Personal Care" },
  { name: "Shampoo & Conditioner", category: "Toiletries & Personal Care" },
  { name: "Deodorant", category: "Toiletries & Personal Care" },
  { name: "Lip Balm", category: "Toiletries & Personal Care" },
  { name: "Hand Sanitizer", category: "Toiletries & Personal Care" },
  { name: "Wet Wipes", category: "Toiletries & Personal Care" },

  // Electronics & Gadgets
  { name: "Power Bank", category: "Electronics & Gadgets" },
  { name: "Universal Adapter", category: "Electronics & Gadgets" },
  { name: "Headphones", category: "Electronics & Gadgets" },
  { name: "Portable Speaker", category: "Electronics & Gadgets" },
  { name: "E-Reader", category: "Electronics & Gadgets" },
  { name: "Travel Router", category: "Electronics & Gadgets" },
  { name: "Smartphone", category: "Electronics & Gadgets" },
  { name: "Laptop/Tablet", category: "Electronics & Gadgets" },

  // Medicines & First Aid
  { name: "First Aid Kit", category: "Medicines & First Aid" },
  { name: "Motion Sickness Pills", category: "Medicines & First Aid" },
  { name: "Pain Relievers", category: "Medicines & First Aid" },
  { name: "Antihistamines", category: "Medicines & First Aid" },
  { name: "Antacids", category: "Medicines & First Aid" },
  { name: "Band-Aids", category: "Medicines & First Aid" },
  { name: "Antiseptic Cream", category: "Medicines & First Aid" },
  { name: "Prescription Medicines", category: "Medicines & First Aid" },

  // Snacks & Food
  { name: "Energy Bars", category: "Snacks & Food" },
  { name: "Water Bottle", category: "Snacks & Food" },
  { name: "Trail Mix", category: "Snacks & Food" },
  { name: "Instant Coffee/Tea", category: "Snacks & Food" },
  { name: "Dried Fruits", category: "Snacks & Food" },
  { name: "Protein Bars", category: "Snacks & Food" },
  { name: "Reusable Cutlery", category: "Snacks & Food" },
  { name: "Collapsible Bowl", category: "Snacks & Food" },

  // Camping Gear
  { name: "Tent", category: "Camping Gear" },
  { name: "Sleeping Bag", category: "Camping Gear" },
  { name: "Camping Stove", category: "Camping Gear" },
  { name: "Headlamp", category: "Camping Gear" },
  { name: "Multi-tool", category: "Camping Gear" },
  { name: "Portable Chair", category: "Camping Gear" },
  { name: "Cooler Box", category: "Camping Gear" },
  { name: "Rope & Carabiners", category: "Camping Gear" },

  // Photography Equipment
  { name: "DSLR Camera", category: "Photography Equipment" },
  { name: "Tripod", category: "Photography Equipment" },
  { name: "Extra Memory Cards", category: "Photography Equipment" },
  { name: "Camera Bag", category: "Photography Equipment" },
  { name: "Lens Cleaning Kit", category: "Photography Equipment" },
  { name: "GoPro", category: "Photography Equipment" },
  { name: "Drone", category: "Photography Equipment" },
  { name: "Camera Rain Cover", category: "Photography Equipment" },
];

/**
 * Generate random groups
 */
async function generateGroups(userIds: string[]) {
  const groups = [];

  for (let i = 0; i < SEED_CONFIG.GROUPS; i++) {
    const createdBy = getRandomItem(userIds);
    const groupName = TRAVEL_GROUP_NAMES[i % TRAVEL_GROUP_NAMES.length];

    groups.push({
      id: generateId(),
      name: groupName,
      description: `Planning our amazing ${groupName.toLowerCase()} adventure! Join us for an unforgettable experience.`,
      createdBy,
      createdAt: randomDate(new Date(2023, 0, 1), new Date()),
      updatedAt: new Date(),
    });
  }

  return groups;
}

/**
 * Generate random group members
 */
async function generateGroupMembers(groups: any[], userIds: string[]) {
  const members = [];

  for (const group of groups) {
    // Make sure the creator is in the group as owner
    members.push({
      id: generateId(),
      groupId: group.id,
      userId: group.createdBy,
      role: "owner" as GroupRole,
      joinedAt: group.createdAt,
      updatedAt: new Date(),
    });

    // Add more random members
    const availableUsers = userIds.filter((id) => id !== group.createdBy);
    const selectedUsers = getRandomItems(
      availableUsers,
      Math.min(SEED_CONFIG.MEMBERS_PER_GROUP, availableUsers.length)
    );

    for (const userId of selectedUsers) {
      const roles: GroupRole[] = ["admin", "member", "viewer"];
      const randomRole = getRandomItem(roles);

      members.push({
        id: generateId(),
        groupId: group.id,
        userId,
        role: randomRole,
        joinedAt: randomDate(new Date(group.createdAt), new Date()),
        updatedAt: new Date(),
      });
    }
  }

  return members;
}

/**
 * Generate random categories
 */
async function generateCategories(groups: any[]) {
  const categories = [];

  for (const group of groups) {
    for (let i = 0; i < SEED_CONFIG.CATEGORIES_PER_GROUP; i++) {
      const groupMembers = await db.query.groupMembers.findMany({
        where: (gm, { eq }) => eq(gm.groupId, group.id),
      });

      const memberIds = groupMembers.map((member) => member.userId);
      const createdBy = getRandomItem(memberIds);
      const categoryName = TRAVEL_CATEGORIES[i % TRAVEL_CATEGORIES.length];

      categories.push({
        id: generateId(),
        name: categoryName,
        description: `Essential ${categoryName.toLowerCase()} for our trip`,
        groupId: group.id,
        createdBy,
        createdAt: randomDate(new Date(group.createdAt), new Date()),
        updatedAt: new Date(),
      });
    }
  }

  return categories;
}

/**
 * Generate random items
 */
async function generateItems(categories: any[]) {
  const items = [];

  for (const category of categories) {
    for (let i = 0; i < SEED_CONFIG.ITEMS_PER_CATEGORY; i++) {
      const groupMembers = await db.query.groupMembers.findMany({
        where: (gm, { eq }) => eq(gm.groupId, category.groupId),
      });

      const memberIds = groupMembers.map((member) => member.userId);
      const createdBy = getRandomItem(memberIds);

      // Filter travel items by category
      const categoryItems = TRAVEL_ITEMS.filter(
        (item) => item.category === category.name
      );

      const selectedItem = categoryItems[i % categoryItems.length] || {
        name: faker.commerce.productName(),
        category: category.name,
      };

      items.push({
        id: generateId(),
        name: selectedItem.name,
        description: `Essential ${selectedItem.name.toLowerCase()} for our trip`,
        quantity:
          Math.floor(Math.random() * 10) +
          1 +
          " " +
          getRandomItem(["pieces", "sets", "pairs"]),
        categoryId: category.id,
        groupId: category.groupId,
        createdBy,
        createdAt: randomDate(new Date(category.createdAt), new Date()),
        updatedAt: new Date(),
      });
    }
  }

  return items;
}

/**
 * Generate random item assignments
 */
async function generateItemAssignments(items: any[]) {
  const assignments = [];

  for (const item of items) {
    const groupMembers = await db.query.groupMembers.findMany({
      where: (gm, { eq }) => eq(gm.groupId, item.groupId),
    });

    const memberIds = groupMembers.map((member) => member.userId);
    const assignmentCount = Math.min(
      SEED_CONFIG.ITEM_ASSIGNMENTS_PER_ITEM,
      memberIds.length
    );
    const assignedToIds = getRandomItems(memberIds, assignmentCount);

    for (const assignedTo of assignedToIds) {
      const assignedBy = getRandomItem(memberIds);
      const statusValues: ItemStatus[] = ["to_pack", "packed", "delivered"];
      const randomStatus = getRandomItem(statusValues);

      assignments.push({
        id: generateId(),
        itemId: item.id,
        assignedTo,
        assignedBy,
        status: randomStatus,
        notes: Math.random() > 0.5 ? faker.lorem.sentence() : null,
        createdAt: randomDate(new Date(item.createdAt), new Date()),
        updatedAt: new Date(),
      });
    }
  }

  return assignments;
}

/**
 * Generate random lists
 */
async function generateLists(groups: any[]) {
  const lists = [];

  for (const group of groups) {
    for (let i = 0; i < SEED_CONFIG.LISTS_PER_GROUP; i++) {
      const groupMembers = await db.query.groupMembers.findMany({
        where: (gm, { eq }) => eq(gm.groupId, group.id),
      });

      const memberIds = groupMembers.map((member) => member.userId);
      const createdBy = getRandomItem(memberIds);

      lists.push({
        id: generateId(),
        name: faker.lorem.words(3) + " List",
        description: faker.lorem.sentence(),
        groupId: group.id,
        createdBy,
        isArchived: Math.random() > 0.8,
        createdAt: randomDate(new Date(group.createdAt), new Date()),
        updatedAt: new Date(),
      });
    }
  }

  return lists;
}

/**
 * Generate random list items
 */
async function generateListItems(lists: any[]) {
  const listItems = [];

  for (const list of lists) {
    for (let i = 0; i < SEED_CONFIG.ITEMS_PER_LIST; i++) {
      const groupMembers = await db.query.groupMembers.findMany({
        where: (gm, { eq }) => eq(gm.groupId, list.groupId),
      });

      const memberIds = groupMembers.map((member) => member.userId);
      const createdBy = getRandomItem(memberIds);
      const statusValues: ItemStatus[] = ["to_pack", "packed", "delivered"];
      const randomStatus = getRandomItem(statusValues);

      listItems.push({
        id: generateId(),
        title: faker.commerce.productName(),
        description: Math.random() > 0.3 ? faker.lorem.sentence() : null,
        listId: list.id,
        status: randomStatus,
        dueDate:
          Math.random() > 0.5
            ? randomDate(
                new Date(),
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              )
            : null,
        createdBy,
        createdAt: randomDate(new Date(list.createdAt), new Date()),
        updatedAt: new Date(),
      });
    }
  }

  return listItems;
}

/**
 * Generate random list item assignments
 */
async function generateListItemAssignments(listItems: any[]) {
  const assignments = [];

  for (const listItem of listItems) {
    const list = await db.query.lists.findFirst({
      where: (l, { eq }) => eq(l.id, listItem.listId),
    });

    if (!list) continue;

    const groupMembers = await db.query.groupMembers.findMany({
      where: (gm, { eq }) => eq(gm.groupId, list.groupId),
    });

    const memberIds = groupMembers.map((member) => member.userId);
    const assignmentCount = Math.min(
      SEED_CONFIG.ASSIGNMENTS_PER_LIST_ITEM,
      memberIds.length
    );
    const assignedToIds = getRandomItems(memberIds, assignmentCount);

    for (const userId of assignedToIds) {
      const assignedBy = getRandomItem(memberIds);

      assignments.push({
        id: generateId(),
        listItemId: listItem.id,
        userId,
        assignedBy,
        assignedAt: randomDate(new Date(listItem.createdAt), new Date()),
      });
    }
  }

  return assignments;
}

/**
 * Seed the database with mock data
 */
export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Generate and hash admin password
    const hashedAdminPassword = await hashPassword(ADMIN_USER.password);

    // Insert admin user
    await db.insert(schema.users).values({
      ...ADMIN_USER,
      password: hashedAdminPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✅ Admin user created");

    // Generate users
    const users = await generateUsers();
    await db.insert(schema.users).values(users);
    console.log(`✅ ${users.length} users created`);

    // Get all user IDs including admin
    const allUsers = await db.query.users.findMany();
    const userIds = allUsers.map((user) => user.id);

    // Generate groups
    const groups = await generateGroups(userIds);
    await db.insert(schema.groups).values(groups);
    console.log(`✅ ${groups.length} groups created`);

    // Generate group members
    const groupMembers = await generateGroupMembers(groups, userIds);
    await db.insert(schema.groupMembers).values(groupMembers);
    console.log(`✅ ${groupMembers.length} group members created`);

    // Generate categories
    const categories = await generateCategories(groups);
    await db.insert(schema.categories).values(categories);
    console.log(`✅ ${categories.length} categories created`);

    // Generate items
    const items = await generateItems(categories);
    await db.insert(schema.items).values(items);
    console.log(`✅ ${items.length} items created`);

    // Generate item assignments
    const itemAssignments = await generateItemAssignments(items);
    await db.insert(schema.itemAssignments).values(itemAssignments);
    console.log(`✅ ${itemAssignments.length} item assignments created`);

    // Generate lists
    const lists = await generateLists(groups);
    await db.insert(schema.lists).values(lists);
    console.log(`✅ ${lists.length} lists created`);

    // Generate list items
    const listItems = await generateListItems(lists);
    await db.insert(schema.listItems).values(listItems);
    console.log(`✅ ${listItems.length} list items created`);

    // Generate list item assignments
    const listItemAssignments = await generateListItemAssignments(listItems);
    await db.insert(schema.listItemAssignments).values(listItemAssignments);
    console.log(
      `✅ ${listItemAssignments.length} list item assignments created`
    );

    console.log("🎉 Database seeding completed successfully");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

async function generateUsers() {
  const users = [];
  const hashedPassword = await hashPassword("password123");

  // Add admin user
  users.push({
    id: ADMIN_USER.id,
    name: ADMIN_USER.name,
    email: ADMIN_USER.email,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Add users with Indian names
  for (let i = 0; i < SEED_CONFIG.USERS; i++) {
    const name = INDIAN_NAMES[i % INDIAN_NAMES.length];
    const email = `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`;

    users.push({
      id: generateId(),
      name,
      email,
      password: hashedPassword,
      createdAt: randomDate(new Date(2023, 0, 1), new Date()),
      updatedAt: new Date(),
    });
  }

  return users;
}
