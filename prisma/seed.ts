import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SERVICES = [
  { slug: "netflix", name: "Netflix" },
  { slug: "prime", name: "Prime Video" },
  { slug: "disney", name: "Disney+" },
  { slug: "max", name: "Max" },
  { slug: "apple", name: "Apple TV+" },
  { slug: "hulu", name: "Hulu" },
  { slug: "paramount", name: "Paramount+" },
  { slug: "peacock", name: "Peacock" },
];

async function main() {
  for (const svc of SERVICES) {
    await prisma.service.upsert({
      where: { slug: svc.slug },
      update: { name: svc.name },
      create: svc,
    });
  }
  console.log(`Seeded ${SERVICES.length} services`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
