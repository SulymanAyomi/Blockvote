// prisma/seed.ts

import { PrismaClient, IdType } from "@/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";


const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({
    adapter,
});

const voters = [
    {
        idType: IdType.NIN,
        idNumber: "41258397014",
        fullName: "Adebayo Samuel",
        email: "adebayo.samuel@example.com",
        dateOfBirth: new Date("1999-03-14"),
    },
    {
        idType: IdType.NIN,
        idNumber: "51829476031",
        fullName: "Fatima Bello",
        email: "fatima.bello@example.com",
        dateOfBirth: new Date("2001-08-22"),
    },
    {
        idType: IdType.NIN,
        idNumber: "60391847215",
        fullName: "Chinedu Okafor",
        email: "chinedu.okafor@example.com",
        dateOfBirth: new Date("1998-12-09"),
    },
    {
        idType: IdType.NIN,
        idNumber: "74920158364",
        fullName: "Grace Johnson",
        email: "grace.johnson@example.com",
        dateOfBirth: new Date("2000-05-18"),
    },
    {
        idType: IdType.NIN,
        idNumber: "83261497025",
        fullName: "Ibrahim Musa",
        email: "ibrahim.musa@example.com",
        dateOfBirth: new Date("1997-10-11"),
    },
    {
        idType: IdType.NIN,
        idNumber: "91573048261",
        fullName: "Esther Daniel",
        email: "esther.daniel@example.com",
        dateOfBirth: new Date("2002-01-27"),
    },
    {
        idType: IdType.NIN,
        idNumber: "12649583740",
        fullName: "Emmanuel Eze",
        email: "emmanuel.eze@example.com",
        dateOfBirth: new Date("1999-07-30"),
    },
    {
        idType: IdType.NIN,
        idNumber: "23861795042",
        fullName: "Mercy Ogunleye",
        email: "mercy.ogunleye@example.com",
        dateOfBirth: new Date("2001-11-16"),
    },
    {
        idType: IdType.NIN,
        idNumber: "34718296053",
        fullName: "David Ojo",
        email: "david.ojo@example.com",
        dateOfBirth: new Date("1998-09-04"),
    },
    {
        idType: IdType.NIN,
        idNumber: "45670381924",
        fullName: "Hauwa Abdullahi",
        email: "hauwa.abdullahi@example.com",
        dateOfBirth: new Date("2000-06-25"),
    },
];

async function main() {
    await prisma.voterRoll.createMany({
        data: voters,
        skipDuplicates: true,
    });

    console.log(`✅ Seeded ${voters.length} voters`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });