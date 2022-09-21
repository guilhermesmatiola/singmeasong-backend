import { prisma } from "../../src/database";

export async function deleteData() {
    
	await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
}