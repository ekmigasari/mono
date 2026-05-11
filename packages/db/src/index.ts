import { env } from "@monorepo/types/server";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

const adapter = new PrismaPg({
	connectionString: env.DATABASE_URL,
});

const prisma = new PrismaClient({
	adapter,
});

export { prisma };
