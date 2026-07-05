import bcrypt from "bcryptjs";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const SERVICES = [
  {
    name: "Herrenschnitt",
    description: "Waschen, Schneiden, Styling.",
    durationMin: 30,
    priceCents: 2500,
    sortOrder: 1,
  },
  {
    name: "Herrenschnitt & Bart",
    description: "Komplettpaket inkl. Bartkontur.",
    durationMin: 45,
    priceCents: 3500,
    sortOrder: 2,
  },
  {
    name: "Bart trimmen",
    description: "Konturenschnitt und Pflege.",
    durationMin: 20,
    priceCents: 1500,
    sortOrder: 3,
  },
  {
    name: "Damenschnitt",
    description: "Waschen, Schneiden, Föhnen.",
    durationMin: 60,
    priceCents: 4500,
    sortOrder: 4,
  },
  {
    name: "Kinderschnitt",
    description: "Für Kinder bis 12 Jahre.",
    durationMin: 20,
    priceCents: 1500,
    sortOrder: 5,
  },
  {
    name: "Waschen & Styling",
    description: "Ohne Schnitt, nur Styling.",
    durationMin: 20,
    priceCents: 1200,
    sortOrder: 6,
  },
];

async function main() {
  for (const service of SERVICES) {
    await db.service.upsert({
      where: { name: service.name },
      update: service,
      create: service,
    });
  }

  const ownerEmail = "chef@showtime-peine.example";
  const ownerPassword = "showtime2026";
  const ownerHash = await bcrypt.hash(ownerPassword, 10);
  await db.user.upsert({
    where: { email: ownerEmail },
    update: { role: "OWNER" },
    create: {
      name: "Showtime Inhaber",
      email: ownerEmail,
      passwordHash: ownerHash,
      role: "OWNER",
    },
  });

  const demoEmail = "kunde@example.com";
  const demoPassword = "kunde12345";
  const demoHash = await bcrypt.hash(demoPassword, 10);
  await db.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      name: "Max Mustermann",
      email: demoEmail,
      phone: "+49 151 00000000",
      passwordHash: demoHash,
      role: "CUSTOMER",
    },
  });

  const STAFF = [
    { name: "Hadi", username: "hadi", password: "hadi12345" },
    { name: "Markus", username: "markus", password: "markus12345" },
  ];
  for (const s of STAFF) {
    const hash = await bcrypt.hash(s.password, 10);
    await db.user.upsert({
      where: { username: s.username },
      update: {},
      create: { name: s.name, username: s.username, passwordHash: hash, role: "STAFF" },
    });
  }

  console.log("\nSeed abgeschlossen.");
  console.log("Owner-Login:  ", ownerEmail, "/", ownerPassword);
  console.log("Demo-Kunde:   ", demoEmail, "/", demoPassword);
  STAFF.forEach((s) => console.log("Mitarbeiter:  ", s.username, "/", s.password));
  console.log("Bitte Passwörter nach dem ersten Login ändern.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
