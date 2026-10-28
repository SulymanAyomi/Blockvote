// seed.ts
import { PrismaClient, IdType, ScopeType, ElectionStatus, NotificationType } from "@/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { lib2026, media2026, Nacos2025, Nacos2026, sug2025, sug2026 } from "./dept";


const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({
    adapter,
});

// ----------------------------------------------------------------------
// Helper: random item from array
// ----------------------------------------------------------------------
function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ----------------------------------------------------------------------
// Helper: generate a random date of birth (18–25 years ago)
// ----------------------------------------------------------------------
function randomDateOfBirth(): Date {
    const now = new Date();
    const yearsAgo = 18 + Math.floor(Math.random() * 8); // 18–25
    const date = new Date(now);
    date.setFullYear(now.getFullYear() - yearsAgo);
    date.setMonth(Math.floor(Math.random() * 12));
    date.setDate(Math.floor(Math.random() * 28) + 1);
    return date;
}

// ----------------------------------------------------------------------
// Helper: generate a random phone number (Nigerian format)
// ----------------------------------------------------------------------
function randomPhone(): string {
    const prefixes = ['080', '081', '090', '091', '070', '0803', '0806', '0813'];
    const prefix = randomItem(prefixes);
    const rest = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
    return prefix + rest;
}

// ----------------------------------------------------------------------
// Helper: generate a random Nigerian‑style ID number
// ----------------------------------------------------------------------
function randomIdNumber(): string {
    // e.g., "NIN-1234567890" or "PVC-9876543210"
    // const types = ['NIN', 'PVC', 'DRL', 'PAS'];
    // const type = randomItem(types);
    const digits = Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)).join('');
    return `${digits}`;
}

// ----------------------------------------------------------------------
// Helper: generate a student ID (optional)
// ----------------------------------------------------------------------
function randomStudentId(): string {
    const year = 2020 + Math.floor(Math.random() * 6); // 2020–2025
    const seq = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `STU/${year}/${seq}`;
}

function randomLevel(): number {
    return randomItem([100, 200, 300, 400]);
}

function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
export const d = (y: number, m: number, day: number, h: number = 0, mi: number = 0) => new Date(y, m - 1, day, h, mi);
export const C = (id: string, name: string, dept: string, level: number, manifesto: string, platform: string[] = [],) => ({
    id,
    name,
    dept,
    level,
    manifesto,
    platform,
});
// ----------------------------------------------------------------------
// Main seeding function 62242795804
// ----------------------------------------------------------------------
async function main() {
    // --- 1. Clear existing data (optional – remove if you want to keep) ---
    await prisma.$transaction([
        // --- leaves: no cascade, must go first ---
        prisma.vote.deleteMany(),                    // child of Ballot (cascade, but clear explicitly for safety)
        prisma.blockchainBallot.deleteMany(),         // no enforced FK, but logically tied to Ballot
        prisma.blockchainResult.deleteMany(),         // no enforced FK, but logically tied to Election
        prisma.blockchainElection.deleteMany(),       // no enforced FK, but logically tied to Election
        prisma.ballot.deleteMany(),                   // child of Election
        prisma.votingSession.deleteMany(),            // child of VoterRoll + Election, NOT cascaded
        prisma.candidate.deleteMany(),                // child of ElectionPosition + VoterRoll, NOT cascaded
        prisma.electionParticipation.deleteMany(),    // child of Election + VoterRoll, NOT cascaded

        // --- election structure ---
        prisma.electionPosition.deleteMany(),         // child of Election + Position (cascade, cleared explicitly)
        prisma.electionScope.deleteMany(),            // child of Election (cascade)
        prisma.election.deleteMany(),                 // child of AcademicSession, NOT cascaded
        prisma.position.deleteMany(),

        // --- voter identity chain ---
        prisma.faceEmbedding.deleteMany(),            // child of FaceReference, NOT cascaded
        prisma.faceReference.deleteMany(),            // child of VoterRoll (cascade)
        prisma.otp.deleteMany(),                      // child of VoterRoll (cascade)
        prisma.registrationSession.deleteMany(),      // child of VoterRoll (cascade)
        prisma.account.deleteMany(),                  // child of VoterRoll (cascade)
        prisma.voterRoll.deleteMany(),                // child of Campus + Faculty + Department, NOT cascaded

        // --- academic + org structure ---
        prisma.academicSession.deleteMany(),
        prisma.programme.deleteMany(),                // child of Department (cascade)
        prisma.department.deleteMany(),               // child of Faculty (cascade)
        prisma.faculty.deleteMany(),                  // child of Institution (cascade)
        prisma.campus.deleteMany(),                   // child of Institution (cascade)
        prisma.institution.deleteMany(),
    ]);

    // --- 2. Create Campus -------------------------------------------------

    const institution = await prisma.institution.create({
        data: {
            name: 'Al-Hikmah university',
            shortName: "ALHIK"
        },
    });
    const campus = await prisma.campus.create({
        data: { name: 'Main Campus', institutionId: institution.id },
    });

    // --- 3. Create Faculties ---------------------------------------------
    const facultyNames = [
        'Faculty of Science',
        'Faculty of Information and Communication Technology',
        'Faculty of Engineering',
        'Faculty of Humanities and Social Science',
        'Faculty of Environmental Sciences',
    ];

    const faculties = await Promise.all(
        facultyNames.map((name) =>
            prisma.faculty.create({ data: { name, institutionId: institution.id } })
        )
    );

    const [
        scienceFaculty,
        ictFaculty,
        engineeringFaculty,
        humanitiesFaculty,
        environmentalFaculty,
    ] = faculties;

    // --- 4. Create Departments -------------------------------------------
    const departmentData = [
        // Science
        { name: 'Department of Computer Science', faculty: ictFaculty },
        { name: 'Department of Mathematics', faculty: scienceFaculty },
        { name: 'Department of Physics', faculty: scienceFaculty },
        { name: 'Department of Chemistry', faculty: scienceFaculty },
        { name: 'Department of Biology', faculty: scienceFaculty },
        { name: 'Department of Biochemistry', faculty: scienceFaculty },
        // ICT
        { name: 'Department of Mass Communication', faculty: ictFaculty },
        { name: 'Department of Libary and Information Systems', faculty: ictFaculty },
        { name: 'Department of Cybersecurity', faculty: ictFaculty },
        // Engineering
        { name: 'Department of Mechanical Engineering', faculty: engineeringFaculty },
        { name: 'Department of Electrical Engineering', faculty: engineeringFaculty },
        { name: 'Department of Civil Engineering', faculty: engineeringFaculty },
        { name: 'Department of Chemical Engineering', faculty: engineeringFaculty },
        // Humanities
        { name: 'Department of Accounting', faculty: humanitiesFaculty },
        { name: 'Department of Economics', faculty: humanitiesFaculty },
        { name: 'Department of Sociology', faculty: humanitiesFaculty },
        { name: 'Department of English', faculty: humanitiesFaculty },
        // Environmental
        { name: 'Department of Architecture', faculty: environmentalFaculty },
        { name: 'Department of Urban Planning', faculty: environmentalFaculty },
    ];

    const departments = await Promise.all(
        departmentData.map(({ name, faculty }) =>
            prisma.department.create({
                data: {
                    name,
                    facultyId: faculty.id,
                },
            })
        )
    );

    // --- 5. Create Programmes for each department ------------------------
    const programmeNamesByDept: Record<string, string[]> = {
        'Department of Mathematics': ['B.Sc Mathematics', 'B.Sc Statistics'],
        'Department of Physics': ['B.Sc Physics', 'B.Sc Electronics'],
        'Department of Chemistry': ['B.Sc Chemistry', 'B.Sc Biochemistry'],
        'Department of Biology': ['B.Sc Biology', 'B.Sc Microbiology'],
        'Department of Biochemistry': ['B.Sc Biochemistry'],
        'Department of Computer Science': ['B.Sc Computer Science', 'B.Sc Software Engineering', 'B.Sc Data Science'],
        'Department of Mass Communication': ['B.A Mass Communication', 'B.A Journalism'],
        'Department of Information Systems': ['B.Sc Information Systems', 'B.Sc Business Informatics'],
        'Department of Cybersecurity': ['B.Sc Cybersecurity', 'B.Sc Digital Forensics'],
        'Department of Mechanical Engineering': ['B.Eng Mechanical Engineering', 'B.Eng Mechatronics'],
        'Department of Electrical Engineering': ['B.Eng Electrical Engineering', 'B.Eng Power Systems'],
        'Department of Civil Engineering': ['B.Eng Civil Engineering', 'B.Eng Structural Engineering'],
        'Department of Chemical Engineering': ['B.Eng Chemical Engineering', 'B.Eng Petroleum Engineering'],
        'Department of Accounting': ['B.Sc Accounting', 'B.Sc Finance'],
        'Department of Economics': ['B.Sc Economics', 'B.Sc Development Economics'],
        'Department of Sociology': ['B.Sc Sociology', 'B.Sc Anthropology'],
        'Department of English': ['B.A English', 'B.A Literature'],
        'Department of Architecture': ['B.Arch Architecture', 'B.Sc Landscape Architecture'],
        'Department of Urban Planning': ['B.Sc Urban Planning', 'B.Sc Regional Planning'],
    };

    const programmeRecords: { id: string; departmentId: string }[] = [];

    for (const dept of departments) {
        const progNames = programmeNamesByDept[dept.name] || ['General Programme'];
        for (const pName of progNames) {
            const prog = await prisma.programme.create({
                data: {
                    name: pName,
                    departmentId: dept.id,
                },
            });
            programmeRecords.push(prog);
        }
    }

    // --- 6. Create VoterRoll (students) ----------------------------------
    // We'll generate about 20–50 students per department.
    const idTypes: IdType[] = ['NIN', 'PASSPORT', 'DRIVERS_LICENSE', 'STUDENT_ID']; // adjust to your enum values
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Lisa', 'Robert', 'Maria', 'William', 'Karen', 'Richard', 'Nancy', 'Joseph', 'Betty', 'Thomas', 'Helen', 'Charles', 'Sandra', 'Christopher', 'Donna', 'Daniel', 'Carol', 'Matthew', 'Ruth', 'Anthony', 'Sharon', 'Mark', 'Michelle', 'Donald', 'Laura', 'Steven', 'Sarah', 'Paul', 'Kimberly', 'Andrew', 'Deborah', 'Kenneth', 'Jessica'];
    const lastNames = ['Adebayo', 'Johnson', 'Olalokun', 'Folawiyo', 'Adebayo', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell'];
    const studentNames = [
        "Oluwaseun David Adeyemi",
        "Emeka Chinedu Nwosu",
        "Esther Oluwatoyin Akinwale",
        "Daniel Chukwuemeka Eze",
        "Zainab Rukayat Lawal",
        "Samuel Olumide Ogunleye",
        "Blessing Efe Oghenekaro",
        "Yusuf Abdulazeez Musa",
        "Mercy Nkem Obi",
        "Michael Tobi Ojo",
        "Precious Ifeoma Ezeani",
        "Victor Ebuka Okoro",
        "Deborah Tolulope Ajayi",
        "Ibrahim Sani Abdullahi",
        "Cynthia Amarachi Umeh",
        "Abdulrahman Musa Yusuf",
        "Chidera Joy Okafor",
        "Oluwaseun David Adeyemi",
        "Aisha Zainab Ibrahim",
        "Chukwuebuka Daniel Eze",
        "Emmanuel Chinedu Okoro",
        "Favour Chisom Eze",
        "Abdulaziz Ahmed Lawal",
    ];

    let voterCount = 0

    // For each student, pick a random programme and department, use it to create voters
    const count = studentNames.length - 1
    for (let i = 0; i < count; i++) {
        const dept = randomItem(departments)
        const deptProgrammes = programmeRecords.filter(
            (p) => p.departmentId === dept.id
        );
        const fullName = studentNames[i];
        const parts = fullName.split(" ")
        const firstName = parts[0];
        const lastName = parts[2];
        const imageUrl = `/${firstName.toLowerCase()}.png`
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@university.edu`;
        const phone = randomPhone();
        const level = randomItem([100, 200, 300, 400]);
        const dateOfBirth = randomDateOfBirth();
        const idType = randomItem(idTypes);
        const idNumber = randomIdNumber();
        const studentId = randomStudentId()
        // Randomly assign a programme from the department
        const programme = randomItem(deptProgrammes);

        await prisma.voterRoll.create({
            data: {
                idType,
                idNumber,
                studentId,
                fullName,
                email,
                imageUrl,
                phone,
                campusId: campus.id,
                facultyId: dept.facultyId,
                departmentId: dept.id,
                programmeId: programme.id,
                level,
                dateOfBirth,
            },
        });

        voterCount++
    }

    // --- 6b. Create a specific voter: Muhammad Jamiu Soliu ---
    const csDept = departments.find(d => d.name === 'Department of Computer Science')!;
    const csProgramme = programmeRecords.find(p => p.departmentId === csDept.id)!;

    await prisma.voterRoll.create({
        data: {
            idType: 'NIN',
            idNumber: randomIdNumber(),
            studentId: randomStudentId(),
            fullName: 'Muhammad Jamiu Soliu',
            email: 'muhammadsoliu@university.edu',
            imageUrl: '/soliu.png',
            phone: randomPhone(),
            campusId: campus.id,
            facultyId: csDept.facultyId,
            departmentId: csDept.id,
            programmeId: csProgramme.id,
            level: 400,
            dateOfBirth: randomDateOfBirth(),
        },
    });
    voterCount++

    // --- 7. (Optional) Create a few Academic Sessions and Elections ------
    const positionNames = [
        'President',
        'Vice President',
        'Speaker',
        'Treasurer',
        'Social Director',
        'Public Relations Officer (PRO)',
        'Deputy Speaker',
        "Editor-in-Chief",
        "Student Member",
        "Academic Officer",
        "Faculty Representative",
        "Faculty Secretary"
    ];

    const positionLevelRequirement: Record<string, number> = {
        'President': 400,
        'Speaker': 400,
        'Treasurer': 400,
        'Vice President': 300,
        'Deputy Speaker': 300,
        'Social Director': 300,
        'Public Relations Officer (PRO)': 200,
    };

    const positions = await Promise.all(
        positionNames.map(name => prisma.position.create({ data: { name } }))
    );
    const positionMap: Record<string, string> = {};
    positions.forEach(p => { positionMap[p.name] = p.id; });

    // 8. Seed Academic Sessions
    const sessions = await Promise.all([
        prisma.academicSession.create({
            data: {
                name: '2025/2026',
                startDate: new Date('2025-09-01'),
                endDate: new Date('2026-07-31'),
                isCurrent: true,
            },
        }),
        prisma.academicSession.create({
            data: {
                name: '2026/2027',
                startDate: new Date('2026-09-01'),
                endDate: new Date('2027-07-31'),
                isCurrent: true,
            },
        }),
        prisma.academicSession.create({
            data: {
                name: '2027/2028',
                startDate: new Date('2027-09-01'),
                endDate: new Date('2028-07-31'),
                isCurrent: false,
            },
        }),
    ]);

    const [session2025, session2026, session2027] = sessions;

    // 9. Seed Elections
    const Elections = [Nacos2026(session2026.id), Nacos2025(session2025.id), lib2026(session2026.id), media2026(session2026.id), sug2025(session2025.id), sug2026(session2026.id)]

    for (const election of Elections) {
        const created = await prisma.$transaction(async (tx) => {
            const newElection = await tx.election.create({
                data: {
                    title: election.title,
                    code: `ELC-${new Date(election.startsAt).getFullYear()}-${String(election.id)}`,
                    description: election.description,
                    coverImage: null,
                    academicSessionId: election.session,
                    startsAt: election.startsAt,
                    endsAt: election.endsAt,
                    status: election.status,
                    scopes: {
                        create: {
                            type: election.scopeType,
                            value: election.scopeValue
                        },
                    },
                },
            });

            const candidates = election.positions.flatMap((p) => {
                const info = p.candidates.map((c) => ({ name: c.name, dept: c.dept, level: c.level, manifesto: c.manifesto, platform: c.platform, position: p.name }))
                return info
            })

            const completedCandidates = [];

            for (const candidate of candidates) {
                const target = candidate.dept.trim().toLowerCase();
                const dept = departments.find((d) => d.name.toLowerCase().includes(target));

                if (!dept) {
                    // Fail fast — a missing dept means we can't build a valid voter row.
                    throw new Error(`Cannot find dept "${candidate.dept}" for candidate "${candidate.name}"`);
                }

                const prog = programmeRecords.find(p => p.departmentId === dept.id);

                const fullName = candidate.name;
                const parts = fullName.split(" ");
                const firstName = parts[0];
                const lastName = parts[2] ?? parts[1];
                const imageUrl = `/${firstName.toLowerCase()}.png`;
                const email =
                    `${firstName.toLowerCase()}.${lastName.toLowerCase()}` +
                    `${Math.floor(Math.random() * 1000)}@university.edu`;

                const voterRecord = await tx.voterRoll.create({
                    data: {
                        idType: randomItem(idTypes),
                        idNumber: randomIdNumber(),
                        studentId: randomStudentId(),
                        fullName,
                        email,
                        imageUrl,
                        phone: randomPhone(),
                        campusId: campus.id,
                        facultyId: dept.facultyId,
                        departmentId: dept.id,
                        programmeId: prog?.id,
                        level: candidate.level,
                        dateOfBirth: randomDateOfBirth(),
                    },
                });

                completedCandidates.push({
                    ...candidate,
                    voterId: voterRecord.id,
                    imageUrl: voterRecord.imageUrl,
                });
            }


            const positionEntries = election.positions.map((p) => ({
                name: p.name,
                description: p.description,
            }));

            for (const position of positionEntries) {
                const positionId = positionMap[position.name];
                if (!positionId) {
                    console.log("position not found:", position.name);
                    continue;
                }

                const positionCandidates = completedCandidates.filter(
                    (cand) => cand.position === position.name
                );
                await tx.electionPosition.create({
                    data: {
                        electionId: newElection.id,
                        positionId,
                        description: position.description,
                        candidates: {
                            createMany: {
                                data: positionCandidates.map((cand) => ({
                                    voterId: cand.voterId,
                                    manifesto: cand.manifesto,
                                    platform: cand.platform,
                                    imageUrl: cand.imageUrl,
                                })),
                            },
                        },
                    },
                });
            }
            return completedCandidates;

        })

        voterCount += created.length;
        console.log("election created ", created[0].name, " ", created.length)
    }


    // We'll store created elections to later add candidates
    const createdElections: any[] = [];

    // 7. Seed Eligbile voters for active election
    // For each election, for each position, pick 2–3 eligible voters from the scope.
    // Eligible: if scope is UNIVERSITY -> any voter; if DEPARTMENT -> voters in that department.
    // We'll create candidates with random manifestos and image URLs.

    const allElections = await prisma.election.findMany({
        where: {
            status: {
                in: ["ACTIVE", "SCHEDULED"]
            },
            academicSessionId: session2026.id
        },
        include: {
            scopes: true,
            positions: {
                include: {
                    position: true,
                },
            },
        },
    });
    // const voters = await prisma.voterRoll.findMany()

    for (const election of allElections) {
        let eligibleVoterIds: { id: string; }[] = [];

        if (election.scopes[0].type === ScopeType.UNIVERSITY) {
            eligibleVoterIds = await prisma.voterRoll.findMany({
                select: {
                    id: true
                }
            });
        } else if (election.scopes[0].type === ScopeType.DEPARTMENT) {
            // scope.value is department name
            const dept = await prisma.department.findFirst({ where: { name: election.scopes[0].value } })
            if (dept) {
                eligibleVoterIds = await prisma.voterRoll.findMany({
                    where: {
                        departmentId: dept.id
                    },
                    select: {
                        id: true
                    }
                });
            }
        } else if (election.scopes[0].type === ScopeType.FACULTY) {
            const faculty = await prisma.faculty.findFirst({ where: { name: election.scopes[0].value } })
            if (faculty) {
                eligibleVoterIds = await prisma.voterRoll.findMany({
                    where: {
                        departmentId: faculty.id
                    },
                    select: {
                        id: true
                    }
                });
            }
        }
    }


    const ANNOUNCEMENTS = [
        {
            id: "an1",
            at: d(2026, 9, 21, 8),
            title:
                "Voting for the 2026 Student Union Election is open until Friday, September 25 at 5:00 PM.",
        },
        {
            id: "an2",
            at: d(2026, 9, 20, 17),
            title:
                "Candidate campaign period ended September 20. Manifestos are on each election page.",
        },
        {
            id: "an3",
            at: d(2026, 9, 18, 9),
            title: "Faculty of Sciences Representative voting begins September 28.",
        },
        {
            id: "an4",
            at: d(2026, 9, 17, 9),
            title:
                "Library Advisory Committee results will be published September 30 at 9:00 AM.",
        },
        {
            id: "an5",
            at: d(2026, 9, 10, 12),
            title:
                "Nominations for the Graduate Students Association election are now closed.",
        },
    ];

    for (const a of ANNOUNCEMENTS) {
        await prisma.announcement.create({
            data: {
                title: a.title,
                createdAt: a.at
            }
        })
    }

    const NOTIFS_SEED = [
        {
            id: "n1",
            type: NotificationType.REMINDER,
            title: "You have not yet voted in the SUG Election.",
            body: "Voting closes Friday, September 25 at 5:00 PM.",
            at: d(2026, 9, 24, 9),
            read: false,
        },
        {
            id: "n2",
            type: NotificationType.ANNOUNCEMENT,
            title: "Voting for SUG Election 2026 is now open.",
            body: "Open the election page to review candidates and vote.",
            at: d(2026, 9, 21, 8),
            read: false,
        },
        {
            id: "n3",
            type: NotificationType.REMINDER,
            title: "Voting closes tomorrow at 5:00 PM.",
            body: "Student Union Government Election 2026.",
            at: d(2026, 9, 23, 17),
            read: false,
        },
        {
            id: "n4",
            type: NotificationType.ANNOUNCEMENT,
            title: "Faculty of Sciences voting begins September 28.",
            body: "You are eligible to vote in this election.",
            at: d(2026, 9, 18, 9),
            read: true,
        },
        {
            id: "n5",
            type: NotificationType.SYSTEM,
            title: "Scheduled maintenance on Sunday, 2:00–3:00 AM.",
            body: "The portal will be briefly unavailable. Voting is not affected.",
            at: d(2026, 9, 17, 15),
            read: true,
        },
        {
            id: "n6",
            type: NotificationType.ANNOUNCEMENT,
            title: "Library Advisory Committee results will be published September 30.",
            body: "You will get a notification when they are available.",
            at: d(2026, 9, 17, 9),
            read: true,
        },
    ];

    for (const n of NOTIFS_SEED) {
        await prisma.notification.create({
            data: {
                type: n.type,
                title: n.title,
                body: n.body,
                createdAt: n.at
            }
        })
    }

    console.log('✅ Seeding completed!');
    console.log(`📊 Statistics:
    - ${faculties.length} Faculties
    - ${departments.length} Departments
    - ${programmeRecords.length} Programmes
    - ${voterCount} Voters
    - ${sessions.length} Academic Sessions
    - ${createdElections.length} Elections
    - ${positions.length} Positions
  `);

}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });