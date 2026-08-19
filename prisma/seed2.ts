// seed.ts
import { PrismaClient, IdType, ScopeType, ElectionStatus } from "@/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";


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
    return randomItem([200, 300, 400]);
}

function randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// ----------------------------------------------------------------------
// Position -> minimum-level eligibility rules
// ----------------------------------------------------------------------
const positionLevelRequirement: Record<string, number> = {
    'President': 400,
    'Speaker': 400,
    'Treasurer': 400,
    'Vice President': 300,
    'Deputy Speaker': 300,
    'Social Director': 300,
    'Public Relations Officer (PRO)': 200,
};

// ----------------------------------------------------------------------
// Main seeding function
// ----------------------------------------------------------------------
async function main() {
    // --- 1. Clear existing data ---
    // Order matters: children (tables holding FKs) must be deleted before
    // the parents they point to.
    await prisma.$transaction([
        prisma.candidate.deleteMany(),
        prisma.electionParticipation.deleteMany(),
        prisma.electionPosition.deleteMany(),
        prisma.electionScope.deleteMany(),
        prisma.election.deleteMany(),
        prisma.position.deleteMany(),
        prisma.voterRoll.deleteMany(),
        prisma.account.deleteMany(),
        prisma.registrationSession.deleteMany(),
        prisma.academicSession.deleteMany(),
        prisma.programme.deleteMany(),
        prisma.department.deleteMany(),
        prisma.faculty.deleteMany(),
        prisma.campus.deleteMany(),
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
    // NOTE: 'Department of Library and Information Systems' name is kept in
    // sync with the key used in programmeNamesByDept below (previously the
    // department was spelled "Libary" and the programme map key said
    // "Department of Information Systems" — a mismatch that silently fell
    // back to a single 'General Programme').
    const departmentData = [
        // Science
        { name: 'Department of Mathematics', faculty: scienceFaculty },
        { name: 'Department of Physics', faculty: scienceFaculty },
        { name: 'Department of Chemistry', faculty: scienceFaculty },
        { name: 'Department of Biology', faculty: scienceFaculty },
        // ICT
        { name: 'Department of Computer Science', faculty: ictFaculty },
        { name: 'Department of Mass Communication', faculty: ictFaculty },
        { name: 'Department of Library and Information Systems', faculty: ictFaculty },
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
        'Department of Computer Science': ['B.Sc Computer Science', 'B.Sc Software Engineering', 'B.Sc Data Science'],
        'Department of Mass Communication': ['B.A Mass Communication', 'B.A Journalism'],
        'Department of Library and Information Systems': ['B.Sc Information Systems', 'B.Sc Business Informatics'],
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

    const programmeRecords: { id: string; departmentId: string; name: string }[] = [];

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
    const idTypes: IdType[] = ['NIN', 'PASSPORT', 'DRIVERS_LICENSE', 'STUDENT_ID']; // adjust to your enum values
    const studentNames = [
        "Abdulrahman Ibrahim Bello",
        "Chiamaka Grace Okafor",
        "Oluwaseun David Adeyemi",
        "Maryam Aisha Suleiman",
        "Emeka Chinedu Nwosu",
        "Esther Oluwatoyin Akinwale",
        "Daniel Chukwuemeka Eze",
        "Zainab Rukayat Lawal",
        "Samuel Olumide Ogunleye",
        "Blessing Efe Oghenekaro",
        "Yusuf Abdulazeez Musa",
        "Mercy Nkem Obi",
        "Michael Tobi Ojo",
        "Fatimah Aminat Mohammed",
        "Precious Ifeoma Ezeani",
        "Victor Ebuka Okoro",
        "Deborah Tolulope Ajayi",
        "Ibrahim Sani Abdullahi",
        "Cynthia Amarachi Umeh",
        "Emmanuel Ayomide Adebayo",
    ];
    // For each department, pick a random programme and create voters
    for (const dept of departments) {
        // Get programmes belonging to this department
        const deptProgrammes = programmeRecords.filter(
            (p) => p.departmentId === dept.id
        );

        if (deptProgrammes.length === 0) continue;

        const count = studentNames.length; // fixed off-by-one (was length - 1, dropping the last name)

        for (let i = 0; i < count; i++) {
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

            // Randomly assign a programme from this department
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
        }
    }

    // --- 6b. Create a specific voter: Muhammad Jamiu Soliu ----------------
    const csDept = departments.find(d => d.name === 'Department of Computer Science')!;
    const csProgramme = programmeRecords.find(
        (p) => p.departmentId === csDept.id && p.name === 'B.Sc Computer Science'
    )!;

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

    // --- 7. Positions ------------------------------------------------------
    const positionNames = [
        'President',
        'Vice President',
        'Speaker',
        'Treasurer',
        'Social Director',
        'Public Relations Officer (PRO)',
        'Deputy Speaker',
    ];
    const positions = await Promise.all(
        positionNames.map(name => prisma.position.create({ data: { name } }))
    );
    const positionMap: Record<string, string> = {};
    positions.forEach(p => { positionMap[p.name] = p.id; });

    // 8. Seed Academic Sessions
    const sessions = await Promise.all([
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
    const [session2026, session2027] = sessions;

    // 9. Seed Elections
    // Dates below are aligned to fall inside session2026 (Sept 2026 – Jul 2027),
    // and after "today" so an OPEN election actually reads as currently live.
    const electionConfigs = [
        {
            title: 'Student Union Election 2026/2027',
            description: 'University wide student government election.',
            session: session2026,
            scopeType: ScopeType.UNIVERSITY,
            scopeValue: 'all',
            positionNames: ['President', 'Vice President', 'Speaker', 'Treasurer', 'Social Director', 'Public Relations Officer (PRO)'],
            startsAt: new Date('2026-10-10T08:00:00'),
            endsAt: new Date('2026-10-12T17:00:00'),
            status: ElectionStatus.OPEN,
        },
        {
            title: 'NACOS Election 2026/2027',
            description: 'National Association of Computer Science Students election.',
            session: session2026,
            scopeType: ScopeType.DEPARTMENT,
            scopeValue: 'Department of Computer Science',
            positionNames: ['President', 'Vice President', 'Speaker', 'Treasurer', 'Social Director'],
            startsAt: new Date('2026-11-01T08:00:00'),
            endsAt: new Date('2026-11-02T17:00:00'),
            status: ElectionStatus.PUBLISHED,
        },
        {
            title: 'Accounting Department Election 2026/2027',
            description: 'Election for the Accounting Department student leaders.',
            session: session2026,
            scopeType: ScopeType.DEPARTMENT,
            scopeValue: 'Department of Accounting',
            positionNames: ['President', 'Vice President', 'Treasurer'],
            startsAt: new Date('2026-11-10T08:00:00'),
            endsAt: new Date('2026-11-11T17:00:00'),
            status: ElectionStatus.DRAFT,
        },
    ];

    const createdElections: any[] = [];

    for (const cfg of electionConfigs) {
        let departmentId: string | undefined;
        if (cfg.scopeType === ScopeType.DEPARTMENT) {
            const dept = departments.find(d => d.name === cfg.scopeValue);
            if (dept) departmentId = dept.id;
        }

        const election = await prisma.election.create({
            data: {
                title: cfg.title,
                description: cfg.description,
                academicSessionId: cfg.session.id,
                startsAt: cfg.startsAt,
                endsAt: cfg.endsAt,
                status: cfg.status,
                scopes: {
                    create: {
                        type: cfg.scopeType,
                        value: cfg.scopeValue,
                    },
                },
            },
        });

        createdElections.push(election);

        for (const posName of cfg.positionNames) {
            const positionId = positionMap[posName];
            if (!positionId) continue;
            await prisma.electionPosition.create({
                data: {
                    electionId: election.id,
                    positionId: positionId,
                },
            });
        }
    }

    // --- 10. Seed Candidates -------------------------------------------
    // For each election, for each position, pick eligible voters that also
    // satisfy the position's minimum-level requirement. A voter is only
    // used once per election (no double-listing as a candidate for two
    // positions in the same election).

    const allElections = await prisma.election.findMany({
        include: {
            scopes: true,
            positions: {
                include: {
                    position: true,
                },
            },
        },
    });
    const voters = await prisma.voterRoll.findMany()

    for (const election of allElections) {
        let eligibleVoterIds: string[] = [];
        const scope = election.scopes[0];

        if (scope.type === ScopeType.UNIVERSITY) {
            eligibleVoterIds = voters.map(v => v.id);
        } else if (scope.type === ScopeType.DEPARTMENT) {
            const dept = departments.find(d => d.name === scope.value);
            if (dept) {
                eligibleVoterIds = voters.filter(v => v.departmentId === dept.id).map(v => v.id);
            }
        } else {
            eligibleVoterIds = voters.map(v => v.id);
        }

        // Register all eligible voters as participants
        for (const vt of eligibleVoterIds) {
            await prisma.electionParticipation.create({
                data: {
                    electionId: election.id,
                    voterId: vt,
                    eligible: true,
                }
            })
        }

        // Track voters already used as a candidate in this election so the
        // same person doesn't end up contesting two positions at once.
        const usedInThisElection = new Set<string>();

        for (const ep of election.positions) {
            const requiredLevel = positionLevelRequirement[ep.position.name];

            const candidatePool = eligibleVoterIds.filter((id) => {
                if (usedInThisElection.has(id)) return false;
                if (!requiredLevel) return true;
                return voters.find((v) => v.id === id)?.level === requiredLevel;
            });

            const count = Math.min(3, candidatePool.length);
            if (count === 0) continue;

            const shuffled = [...candidatePool].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, count);

            for (const voterId of selected) {
                usedInThisElection.add(voterId);
                const imageUrl = voters.find((v) => v.id == voterId)?.imageUrl
                await prisma.candidate.create({
                    data: {
                        electionPositionId: ep.id,
                        voterId: voterId,
                        manifesto: "I am committed to serving the student body. My vision is to improve welfare and academic excellence.",
                        imageUrl
                    },
                });
            }
        }
    }

    console.log('✅ Seeding completed!');
    console.log(`📊 Statistics:
    - ${faculties.length} Faculties
    - ${departments.length} Departments
    - ${programmeRecords.length} Programmes
    - ${voters.length} Voters
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