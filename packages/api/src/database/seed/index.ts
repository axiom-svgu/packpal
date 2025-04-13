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
  BATCH_SIZE: 100, // Batch size for database operations
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
 * Insert data in batches
 */
async function batchInsert(table: any, data: any[]) {
  const batchSize = SEED_CONFIG.BATCH_SIZE;
  const batches = Math.ceil(data.length / batchSize);

  for (let i = 0; i < batches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, data.length);
    const batch = data.slice(start, end);

    if (batch.length > 0) {
      await db.insert(table).values(batch);
    }
  }

  return data.length;
}

/**
 * Generate random groups
 */
function generateGroups(userIds: string[]) {
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
function generateGroupMembers(groups: any[], userIds: string[]) {
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
function generateCategories(groups: any[], groupMembers: any[]) {
  const categories = [];

  // Create a map of groupId to member userIds for faster lookup
  const groupMembersMap = new Map();
  for (const member of groupMembers) {
    if (!groupMembersMap.has(member.groupId)) {
      groupMembersMap.set(member.groupId, []);
    }
    groupMembersMap.get(member.groupId).push(member.userId);
  }

  for (const group of groups) {
    const memberIds = groupMembersMap.get(group.id) || [];
    if (memberIds.length === 0) continue;

    for (let i = 0; i < SEED_CONFIG.CATEGORIES_PER_GROUP; i++) {
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
function generateItems(categories: any[], groupMembers: any[]) {
  const items = [];

  // Create a map of groupId to member userIds for faster lookup
  const groupMembersMap = new Map();
  for (const member of groupMembers) {
    if (!groupMembersMap.has(member.groupId)) {
      groupMembersMap.set(member.groupId, []);
    }
    groupMembersMap.get(member.groupId).push(member.userId);
  }

  // Group categories by name for faster lookup
  const categorizedItems: Record<string, (typeof TRAVEL_ITEMS)[0][]> = {};
  TRAVEL_ITEMS.forEach((item) => {
    if (!categorizedItems[item.category]) {
      categorizedItems[item.category] = [];
    }
    categorizedItems[item.category].push(item);
  });

  for (const category of categories) {
    const memberIds = groupMembersMap.get(category.groupId) || [];
    if (memberIds.length === 0) continue;

    for (let i = 0; i < SEED_CONFIG.ITEMS_PER_CATEGORY; i++) {
      const createdBy = getRandomItem(memberIds);

      // Get items for this category
      const categoryItems = categorizedItems[category.name] || [];
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
function generateItemAssignments(items: any[], groupMembers: any[]) {
  const assignments = [];

  // Create a map of groupId to member userIds for faster lookup
  const groupMembersMap = new Map();
  for (const member of groupMembers) {
    if (!groupMembersMap.has(member.groupId)) {
      groupMembersMap.set(member.groupId, []);
    }
    groupMembersMap.get(member.groupId).push(member.userId);
  }

  for (const item of items) {
    const memberIds = groupMembersMap.get(item.groupId) || [];
    if (memberIds.length === 0) continue;

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
function generateLists(groups: any[], groupMembers: any[]) {
  const lists = [];

  // Create a map of groupId to member userIds for faster lookup
  const groupMembersMap = new Map();
  for (const member of groupMembers) {
    if (!groupMembersMap.has(member.groupId)) {
      groupMembersMap.set(member.groupId, []);
    }
    groupMembersMap.get(member.groupId).push(member.userId);
  }

  for (const group of groups) {
    const memberIds = groupMembersMap.get(group.id) || [];
    if (memberIds.length === 0) continue;

    for (let i = 0; i < SEED_CONFIG.LISTS_PER_GROUP; i++) {
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
function generateListItems(lists: any[], groupMembers: any[]) {
  const listItems = [];

  // Create a map of groupId to member userIds for faster lookup
  const groupMembersMap = new Map();
  for (const member of groupMembers) {
    if (!groupMembersMap.has(member.groupId)) {
      groupMembersMap.set(member.groupId, []);
    }
    groupMembersMap.get(member.groupId).push(member.userId);
  }

  // Create a map of listId to groupId for faster lookup
  const listGroupMap = new Map();
  for (const list of lists) {
    listGroupMap.set(list.id, list.groupId);
  }

  for (const list of lists) {
    const memberIds = groupMembersMap.get(list.groupId) || [];
    if (memberIds.length === 0) continue;

    for (let i = 0; i < SEED_CONFIG.ITEMS_PER_LIST; i++) {
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
function generateListItemAssignments(
  listItems: any[],
  lists: any[],
  groupMembers: any[]
) {
  const assignments = [];

  // Create a map of groupId to member userIds for faster lookup
  const groupMembersMap = new Map();
  for (const member of groupMembers) {
    if (!groupMembersMap.has(member.groupId)) {
      groupMembersMap.set(member.groupId, []);
    }
    groupMembersMap.get(member.groupId).push(member.userId);
  }

  // Create a map of listId to groupId for faster lookup
  const listGroupMap = new Map();
  for (const list of lists) {
    listGroupMap.set(list.id, list.groupId);
  }

  for (const listItem of listItems) {
    const listId = listItem.listId;
    const groupId = listGroupMap.get(listId);

    if (!groupId) continue;

    const memberIds = groupMembersMap.get(groupId) || [];
    if (memberIds.length === 0) continue;

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
 * Generate users
 */
async function generateUsers() {
  const users = [];
  const hashedPassword = await hashPassword("password123");

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

/**
 * Seed the database with mock data
 */
export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");
    console.time("Database seeding");

    // Check if admin user already exists
    const existingAdmin = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.email, ADMIN_USER.email),
    });

    if (!existingAdmin) {
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
    } else {
      console.log("⏭️ Admin user already exists, skipping creation");
    }

    // Generate users (admin excluded)
    const users = await generateUsers();
    if (users.length > 0) {
      await batchInsert(schema.users, users);
      console.log(`✅ ${users.length} users created`);
    }

    // Get all user IDs including admin
    const allUsers = await db.query.users.findMany();
    const userIds = allUsers.map((user) => user.id);

    // Check if groups already exist
    const existingGroups = await db.query.groups.findMany();
    if (existingGroups.length > 0) {
      console.log(
        "⏭️ Groups already exist, skipping creation of groups and related entities"
      );
      console.log("🎉 Database seeding completed successfully");
      console.timeEnd("Database seeding");
      return;
    }

    // Generate groups
    const groups = generateGroups(userIds);
    await batchInsert(schema.groups, groups);
    console.log(`✅ ${groups.length} groups created`);

    // Generate group members
    const groupMembers = generateGroupMembers(groups, userIds);
    await batchInsert(schema.groupMembers, groupMembers);
    console.log(`✅ ${groupMembers.length} group members created`);

    // Generate categories (now uses in-memory groupMembers)
    const categories = generateCategories(groups, groupMembers);
    await batchInsert(schema.categories, categories);
    console.log(`✅ ${categories.length} categories created`);

    // Generate items (now uses in-memory groupMembers)
    const items = generateItems(categories, groupMembers);
    await batchInsert(schema.items, items);
    console.log(`✅ ${items.length} items created`);

    // Generate item assignments (now uses in-memory groupMembers)
    const itemAssignments = generateItemAssignments(items, groupMembers);
    await batchInsert(schema.itemAssignments, itemAssignments);
    console.log(`✅ ${itemAssignments.length} item assignments created`);

    // Generate lists (now uses in-memory groupMembers)
    const lists = generateLists(groups, groupMembers);
    await batchInsert(schema.lists, lists);
    console.log(`✅ ${lists.length} lists created`);

    // Generate list items (now uses in-memory groupMembers and lists)
    const listItems = generateListItems(lists, groupMembers);
    await batchInsert(schema.listItems, listItems);
    console.log(`✅ ${listItems.length} list items created`);

    // Generate list item assignments (now uses in-memory groupMembers, lists, and listItems)
    const listItemAssignments = generateListItemAssignments(
      listItems,
      lists,
      groupMembers
    );
    await batchInsert(schema.listItemAssignments, listItemAssignments);
    console.log(
      `✅ ${listItemAssignments.length} list item assignments created`
    );

    console.log("🎉 Database seeding completed successfully");
    console.timeEnd("Database seeding");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}
