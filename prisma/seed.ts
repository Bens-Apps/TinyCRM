import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_RELATIONSHIP_TYPES = [
  { name: "Client", color: "#6366f1", sortOrder: 0 },
  { name: "Prospect", color: "#8b5cf6", sortOrder: 1 },
  { name: "Lead", color: "#a855f7", sortOrder: 2 },
  { name: "Partner", color: "#06b6d4", sortOrder: 3 },
  { name: "Friend", color: "#10b981", sortOrder: 4 },
  { name: "Investor", color: "#f59e0b", sortOrder: 5 },
  { name: "Network", color: "#6b7280", sortOrder: 6 },
];

export async function seedRelationshipTypes(userId: string) {
  const existing = await prisma.relationshipType.findMany({
    where: { userId },
  });

  if (existing.length > 0) return;

  await prisma.relationshipType.createMany({
    data: DEFAULT_RELATIONSHIP_TYPES.map((rt) => ({
      ...rt,
      userId,
    })),
  });
}

async function main() {
  console.log("Seed script ready. Relationship types are seeded per-user on first sign-in.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
