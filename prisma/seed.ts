import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@dossierloc.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "AdminChangeMe123!";
  const hash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      password: hash,
      name: "Administrateur",
      role: "admin",
    },
    update: { password: hash, role: "admin" },
  });

  await prisma.dossierSequence.upsert({
    where: { id: "default" },
    create: { id: "default", value: 0 },
    update: {},
  });

  const demoClientEmail = process.env.SEED_CLIENT_EMAIL ?? "client@dossierloc.local";
  const clientPassword = process.env.SEED_CLIENT_PASSWORD ?? "ClientChangeMe123!";
  const clientHash = await bcrypt.hash(clientPassword, 12);

  await prisma.user.upsert({
    where: { email: demoClientEmail },
    create: {
      email: demoClientEmail,
      password: clientHash,
      name: "Jean Dupont",
      role: "client",
    },
    update: {},
  });

  console.log("Seed OK — comptes :");
  console.log(`  Admin   ${adminEmail} / ${adminPassword}`);
  console.log(`  Client  ${demoClientEmail} / ${clientPassword}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
