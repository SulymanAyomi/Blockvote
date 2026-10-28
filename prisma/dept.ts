import { ElectionStatus, ScopeType } from "@/generated/enums";
import { C, d } from "./seed1";
const filler = "Focused on listening to students and reporting back openly.";

export const Nacos2026 = (sessionId: string) => ({
  id: "cs-2026",
  title: "Computer Science Department Election NACOS 2025/2026",
  description:
    "Choose the student leaders of the Department of Computer Science for the coming year.",
  session: sessionId,
  scopeType: ScopeType.DEPARTMENT,
  scopeValue: "Department of Computer Science",
  positionNames: [
    "President",
    "Vice President",
    "Speaker",
    "Deputy Speaker",
    "Treasurer",
    "Social Director",
    "Academic Officer",
  ],
  startsAt: new Date("2026-09-30T08:00:00"),
  endsAt: new Date("2026-10-28T17:00:00"),
  status: ElectionStatus.ACTIVE,
  about:
    "This election allows Computer Science students to choose their department representatives.",
  positions: [
    {
      id: "dept-pres",
      name: "President",
      description: "Leads the departmental students' association.",
      candidates: [
        C(
          "dp-1",
          "Abdulrahman Ibrahim Bello",
          "Computer Science",
          400,
          "Industry mentorship for every level and open lab nights.",
          ["Mentorship matching", "Open lab nights"],
        ),
        C(
          "dp-2",
          "Chiamaka Grace Okafor",
          "Computer Science",
          300,
          "A peer tutoring programme and a project showcase each term.",
          ["Peer tutoring", "Termly project showcase"],
        ),
        {
          name: "Emmanuel Ayomide Adebayo",
          dept: "Computer Science",
          level: 300,
          manifesto:
            "Bridging the gap between coursework and real-world skills — more workshops, less theory-only lectures.",
          platform: [
            "Monthly workshops on in-demand tech stacks",
            "Partner with alumni for internship referrals",
            "Departmental resource hub for past exams and notes",
          ],
        },
        {
          name: "Bashir Lawal",
          dept: "Computer Science",
          level: 300,
          manifesto:
            "Better lab equipment and software licenses — students shouldn't have to work around outdated tools.",
          platform: [
            "Push for updated software licenses in all labs",
            "Upgrade lab computers before final year projects",
            "Termly equipment audit with student feedback",
          ],
        },
        {
          name: "Victory Iniobong Ekanem",
          dept: "Computer Science",
          level: 400,
          manifesto:
            "Community and visibility — put CS students on the map with competitions and showcases.",
          platform: [
            "Represent the department in inter-school hackathons",
            "Annual department career fair with tech companies",
            "Newsletter highlighting student projects and achievements",
          ],
        },
      ],
    },
    {
      id: "dept-vice-pres",
      name: "Vice President",
      description: "Assist the president and oversees the association's activities in their absence.",
      candidates: [
        {
          name: "Chinedu Okafor",
          dept: "Computer Science",
          level: 300,
          manifesto:
            "A vice-president focused on closing the gap between what we're taught and what the industry actually wants.",
          platform: [
            "Curriculum feedback sessions with final-year students",
            "Invite industry speakers every month",
            "Push for updated course content aligned with current tech",
          ],
        },
        {
          name: "Amina Yusuf",
          dept: "Computer Science",
          level: 400,
          manifesto:
            "Supporting students behind the scenes — better communication between reps, lecturers, and students.",
          platform: [
            "Weekly digest of departmental announcements and deadlines",
            "Direct liaison office between students and lecturers",
            "Anonymous feedback channel for course complaints",
          ],
        },
        {
          name: "Victor Nwadike",
          dept: "Computer Science",
          level: 300,
          manifesto:
            "A department that works for everyone — equal access to opportunities regardless of CGPA.",
          platform: [
            "Open internship listings to all levels, not just finalists",
            "Study groups paired across performance levels",
            "Termly open forum on departmental concerns",
          ],
        },
        {
          name: "Faith Etim",
          dept: "Computer Science",
          level: 400,
          manifesto:
            "Championing gender balance and inclusion within the department's tech community.",
          platform: [
            "Women-in-tech mentorship circle",
            "Inclusive hackathon teams and event planning",
            "Support fund for conference and competition travel",
          ],
        },
      ],
    },
    {
      id: "dept-speaker",
      name: "Speaker",
      description: "Presides over the legislative proceedings of the departmental student's association.",
      candidates: [
        {
          name: "Daniel Okon",
          dept: "Computer Science",
          level: 400,
          manifesto:
            "Organized, transparent departmental meetings where every voice on the floor is documented and acted on.",
          platform: [
            "Publish meeting minutes within 48 hours",
            "Structured agenda for every departmental meeting",
            "Track and follow up on raised issues termly",
          ],
        },
        {
          name: "Precious Udo",
          dept: "Computer Science",
          level: 300,
          manifesto:
            "Making departmental meetings less of a formality and more of a real forum for change.",
          platform: [
            "Open floor segment for student concerns each meeting",
            "Rotating meeting times to accommodate more students",
            "Simplify the process to raise a motion",
          ],
        },
        {
          name: "Michael Adeyanju",
          dept: "Computer Science",
          level: 400,
          manifesto:
            "A speaker who keeps proceedings fair, fast, and focused on outcomes.",
          platform: [
            "Enforce time limits on debates to keep meetings efficient",
            "Digital motion-tracking sheet visible to all students",
            "Termly review of departmental bylaws",
          ],
        },
        {
          name: "Esther Nkemdirim",
          dept: "Computer Science",
          level: 300,
          manifesto:
            "Bringing every level rep to the table — no year group left out of decision-making.",
          platform: [
            "Guarantee floor time for reps from every level",
            "Mentorship pairing between senior and junior reps",
            "Post-meeting summaries shared in class group chats",
          ],
        },
      ],
    },
    {
      id: "dept-dep-speaker",
      name: "Deputy Speaker",
      description: "Assist the speaker and presides over the legislative proceedings in their absence.",
      candidates: [
        {
          name: "Ibrahim Musa",
          dept: "Computer Science",
          level: 300,
          manifesto:
            "Supporting the speaker's office and keeping departmental processes running smoothly.",
          platform: [
            "Manage scheduling for all departmental sub-committees",
            "Backup facilitator for meetings when speaker is unavailable",
            "Maintain a shared record of past resolutions",
          ],
        },
        {
          name: "Confidence Iheanacho",
          dept: "Computer Science",
          level: 400,
          manifesto:
            "A deputy who bridges levels — making sure 100 and 200 level voices aren't drowned out.",
          platform: [
            "Dedicated floor time for junior-level reps",
            "Orientation sessions on how departmental governance works",
            "Buddy system pairing junior and senior class reps",
          ],
        },
        {
          name: "Samuel Ekong",
          dept: "Computer Science",
          level: 300,
          manifesto:
            "Efficient, no-nonsense meetings — less talk, more resolutions.",
          platform: [
            "Standardized templates for meeting agendas",
            "Strict time-boxing for each agenda item",
            "Digital archive of all departmental decisions",
          ],
        },
        {
          name: "Blessing Nwankwo",
          dept: "Computer Science",
          level: 400,
          manifesto:
            "Approachable leadership — regular check-ins with reps and students outside formal meetings.",
          platform: [
            "Monthly informal check-in sessions with class reps",
            "Anonymous suggestion box reviewed before each meeting",
            "Mediation support for rep-to-rep disagreements",
          ],
        },
      ],
    },
    {
      id: "dept-Treasurer",
      name: "Treasurer",
      description: "Manages the association's finances and financial records.",
      candidates: [
        {
          name: "Emmanuel Okwuosa",
          dept: "Computer Science",
          level: 400,
          manifesto:
            "Transparent handling of departmental dues — students deserve to know where their money goes.",
          platform: [
            "Publish a termly financial report for departmental dues",
            "Independent review of departmental spending each year",
            "Clear breakdown of costs for department-funded events",
          ],
        },
        {
          name: "Ogechi Chukwuma",
          dept: "Computer Science",
          level: 300,
          manifesto:
            "Smarter spending on things that matter — lab materials and project funding first.",
          platform: [
            "Prioritize funding for final-year project materials",
            "Cut costs on non-essential departmental events",
            "Student input on how discretionary funds are spent",
          ],
        },
        {
          name: "David Anyaegbunam",
          dept: "Computer Science",
          level: 400,
          manifesto:
            "Planning ahead — building a reserve fund so the department isn't caught off guard.",
          platform: [
            "Set up an emergency fund for urgent lab repairs",
            "Multi-term budget planning instead of one-off spending",
            "Cost comparison before major departmental purchases",
          ],
        },
        {
          name: "Joy Attah",
          dept: "Computer Science",
          level: 300,
          manifesto:
            "An open-book treasury — every student can ask, every student gets an answer.",
          platform: [
            "Open Q&A session on finances every term",
            "Receipts published for major departmental expenses",
            "Simplified refund process for unused event fees",
          ],
        },
      ],
    },
    {
      id: "dept-social-director",
      name: "Social Director",
      description: "Organizes social events and activities for departmental students.",
      candidates: [
        {
          name: "Kingsley Eze",
          dept: "Computer Science",
          level: 300,
          manifesto:
            "Making CS department events something to look forward to — hackathons, game nights, and more.",
          platform: [
            "Termly hackathon with prizes for top teams",
            "Game and social nights to build department community",
            "Departmental merchandise (hoodies, stickers) each session",
          ],
        },
        {
          name: "Adaobi Onwuka",
          dept: "Computer Science",
          level: 400,
          manifesto:
            "Balancing fun with career growth — social events that also open doors.",
          platform: [
            "Networking mixers with tech alumni",
            "Department dinner and awards night each session",
            "Collaborate with other departments for joint events",
          ],
        },
        {
          name: "Femi Ogundipe",
          dept: "Computer Science",
          level: 300,
          manifesto:
            "Affordable, frequent events so every student can actually attend and enjoy.",
          platform: [
            "Free or low-cost departmental events every term",
            "Survey students on preferred event types",
            "Partner with vendors for discounted event costs",
          ],
        },
        {
          name: "Ronke Salami",
          dept: "Computer Science",
          level: 400,
          manifesto:
            "A social calendar that reflects the whole department — inclusive, creative, and well-planned.",
          platform: [
            "Publish a termly events calendar in advance",
            "Themed events celebrating department milestones",
            "Feedback forms after each event to improve future planning",
          ],
        },
      ],
    },
    {
      id: "dept-acad",
      name: "Academic Officer",
      description: "Coordinates study groups, past papers and course feedback.",
      candidates: [
        C(
          "da-1",
          "Ravi Shah",
          "Computer Science",
          300,
          "A shared past-paper library and course feedback that is acted on.",
          ["Past-paper library", "Course feedback reports"],
        ),
        C(
          "da-2",
          "Emeka Obi",
          "Computer Science",
          200,
          "Weekly revision clinics led by senior students.",
          ["Weekly revision clinics"],
        ),
      ],
    },
  ],
});

export const Nacos2025 = (sessionId: string) => ({
  id: "cs-2025",
  title: "Computer Science Department Election NACOS 2024/2025",
  description:
    "Choose the student leaders of the Department of Computer Science for the coming year.",
  session: sessionId,
  scopeType: ScopeType.DEPARTMENT,
  scopeValue: "Department of Computer Science",
  positionNames: [
    "President"
  ],
  startsAt: d(2025, 11, 3, 8),
  endsAt: d(2025, 11, 5, 17),
  status: ElectionStatus.COMPLETED,
  about:
    "This election allows Computer Science students to choose their department representatives.",
  positions: [
    {
      id: "p",
      name: "President",
      description: "Leads the departmental association.",
      candidates: [
        C(
          "b1",
          "Yusuf Bello",
          "Computer Science",
          400,
          "A peer tutoring programme and a project showcase each term.",
          ["Peer tutoring", "Termly project showcase"],
        ),
        C("b2", "Grace Ifeoma Nwachukwu", "Computer Science", 300,
          "Bridging the gap between coursework and real-world skills — more workshops, less theory-only lectures.",
          [
            "Monthly workshops on in-demand tech stacks",
            "Partner with alumni for internship referrals",
            "Departmental resource hub for past exams and notes",
          ]
        ),
      ],
    },
  ],
})

export const lib2026 = (sessionId: string) => ({
  id: "lib-2026",
  title: "Library Advisory Committee Election 2026",
  scopeValue: "University-wide",
  startsAt: d(2026, 9, 14, 8),
  endsAt: d(2026, 9, 16, 17),
  session: sessionId,
  scopeType: ScopeType.UNIVERSITY,
  positionNames: [
    "Student Member"
  ],
  status: ElectionStatus.COMPLETED,
  description: "Choose student members of the library advisory committee.",
  about: "Completed election.",
  positions: [
    {
      id: "p",
      name: "Student Member",
      description: "Advises on library services and opening hours.",
      candidates: [
        C("d1", "Abdulrahman Ishola", "Mass Communication", 300, filler, [],),
        C("d2", "Peter Layi", "Libary and Information Systems", 400, filler, [],),
      ],
    },
  ],
})

export const media2026 = (sessionId: string) => ({
  id: "media-2026",
  title: "Student Media Board Election 2026",
  scopeValue: "University-wide",
  scopeType: ScopeType.UNIVERSITY,
  session: sessionId,
  startsAt: d(2026, 2, 9, 8),
  endsAt: d(2026, 2, 11, 17),
  status: ElectionStatus.COMPLETED,
  description:
    "Elect the editors of the campus radio, newspaper and online channels.",
  about: "Completed election.",
  positionNames: [
    "Editor-in-Chief"
  ],
  positions: [
    {
      id: "p",
      name: "Editor-in-Chief",
      description: "Leads the student media board.",
      candidates: [
        C(
          "c1",
          "Fatima Hauwa Bello",
          "Mass Communication",
          300,
          filler,
          [],
        ),
        C(
          "c2",
          "Zainab Maryam Abdullahi",
          "English",
          400,
          filler,
          [],
        ),
        C(
          "c3",
          "Precious Amarachi Nwankwo",
          "Libary and Information Systems",
          200,
          filler,
          [],
        ),
      ],
    },
  ],
})

export const sug2025 = (sessionId: string) =>
({
  id: "sug-2025",
  title: "Student Union Government Election 2025",
  scopeValue: "University-wide",
  scopeType: ScopeType.UNIVERSITY,
  session: sessionId,
  startsAt: d(2025, 9, 29, 8),
  endsAt: d(2025, 10, 3, 17),
  status: ElectionStatus.COMPLETED,
  description: "The 2025/26 Student Union Government election.",
  about: "Completed election.",
  positionNames: [
    "President"],
  positions: [
    {
      id: "p",
      name: "President",
      description: "Head of the Student Union Government.",
      candidates: [
        C("a1", "Tobenna Okoye", "Cybersecurity", 400, filler, []),
        C("a2", "Biodun Ridwan", "Economics", 300, filler, [],),
        C("a3", "Jamal Kolade", "Mechanical Engineering", 300, filler, [],),
      ],
    },
    {
      id: "v",
      name: "Vice President",
      description: "Leads student welfare.",
      candidates: [
        C("a4", "Elena Peter", "Biology", 300, filler, [],),
        C("a5", "Femi Ajayi", "Biochemistry", 400, filler, [],),
      ],
    },
  ],
})

export const sug2026 = (sessionId: string) => (
  {
    id: "sug-2026",
    title: 'Student Union Election 2025/2026',
    description: "Choose the students who will represent the whole campus on fees, facilities, welfare and student life for the 2026/27 academic year.",
    about: "This election allows eligible students to vote for representatives of the Student Union Government. You will choose one candidate for each of the five positions.",
    session: sessionId,
    scopeType: ScopeType.UNIVERSITY,
    scopeValue: 'University-wide',
    startsAt: new Date('2026-09-18T08:00:00'),
    endsAt: new Date('2026-09-18T17:00:00'),
    status: ElectionStatus.ACTIVE,
    positionNames: [
      "President",
      "Vice President",
      "Speaker",
      "Deputy Speaker",
      "Treasurer",
      "Social Director",
    ],
    positions: [
      {
        id: "president",
        name: "President",
        description: "Head of the Student Union Government.",
        candidates: [
          C(
            "pres-1",
            "Ibrahim Sani Musa",
            "English",
            400,
            "Fair fees, longer library hours, and a union that answers every message within 48 hours.",
            [
              "Publish the union budget every term",
              "Extend library opening hours during exams",
              "48-hour reply promise on every student query",
            ],
          ),
          C(
            "pres-2",
            "Daniel Etim Akpan",
            "Mechanical Engineering",
            300,
            "Paid campus internships in every faculty and a student-run job board.",
            [
              "Launch 150 paid campus internships",
              "Create a student-run job board",
              "Faculty career days each semester",
            ],
          ),
          C(
            "pres-3",
            "Fatimah Aminat Mohammed",
            "Economics",
            400,
            "Cheaper campus food, safer late-night transport, and a mental health line that never closes.",
            [
              "Subsidised meals in all canteens",
              "Late-night shuttle on every route",
              "24/7 peer support line",
            ],
          ),
          {
            name: "Samuel Oluwadamilare Oladipo",
            dept: "Sociology",
            level: 300,
            manifesto: "A leaner, more transparent union that spends on students first — clubs, transport, and mental health support.",
            platform: [
              "Cut union event overhead by 20% and redirect funds to club grants",
              "Subsidized shuttle service for off-campus students",
              "Free weekly counseling drop-in sessions",
            ],
          },
          {
            id: "pres-2",
            name: "Amara Nwosu",
            dept: "Mass Communication",
            level: 400,
            manifesto: "A union you can see and hear — live-streamed meetings, open town halls, and real accountability.",
            platform: [
              "Live-stream every union congress meeting",
              "Monthly open town hall with the executive council",
              "Independent student ombudsman office",
            ],
          }
        ],
      },
      {
        id: "vice-president",
        name: "Vice President",
        description: "Leads student welfare and supports the President.",
        candidates: [
          C(
            "vp-1",
            "Temiloluwa Grace Adebayo",
            "Civil Engineering",
            300,
            "A welfare desk in every hall of residence and clearer rules for student complaints.",
            [
              "Welfare desk in every hall",
              "Plain-language complaints process",
              "Monthly open forum with management",
            ],
          ),
          C(
            "vp-2",
            "Precious Raman",
            "Biology",
            300,
            "Better lab access for every science student and a fair timetable for practicals.",
            [
              "Extended open-lab hours",
              "Practical timetable published early",
              "Equipment loan scheme",
            ],
          ),
          C(
            "vp-3",
            "Esther Oluwatoyin Olamide",
            "Architecture",
            400,
            "Studio spaces open around the clock and a real budget for student projects.",
            [
              "24-hour studio access",
              "Project grants for every faculty",
              "Quiet study zones in every building",
            ],
          ),
          {
            name: "Maryam Aisha Suleiman",
            dept: "Computer Science",
            level: 400,
            manifesto: "A vice-president who bridges students and administration — clear channels, faster resolutions, no bureaucracy.",
            platform: [
              "Set up a direct student-dean liaison office",
              "Termly open forum with faculty administrators",
              "Digital tracker for unresolved student complaints",
            ],
          },
          {
            name: "Kelechi Umeh",
            dept: "Mechanical Engineering",
            level: 300,
            manifesto: "Stronger hostels, better facilities, and a campus that actually works for everyday student life.",
            platform: [
              "Push for 24-hour power supply in all hostels",
              "Renovate common rooms and study spaces",
              "Quarterly facilities audit with published results",
            ],
          },
          {
            name: "Blessing Adeyemi",
            dept: "Sociology",
            level: 400,
            manifesto: "Inclusion first — a union that works for every student, regardless of department, gender, or background.",
            platform: [
              "Create a diversity and inclusion desk in the union",
              "Termly disability-access review of campus buildings",
              "Support fund for international and exchange students",
            ],
          },
          {
            name: "Emeka Ibrahim",
            dept: "Computer Science",
            level: 300,
            manifesto: "Tech-forward representation — digitize union services and make student advocacy data-driven.",
            platform: [
              "Build a mobile app for union announcements and complaints",
              "Online voting system for all union elections",
              "Annual student satisfaction survey with published results",
            ],
          }

        ],
      },
      {
        id: "speaker",
        name: "Speaker",
        description: "Chairs Student Union meetings and keeps debates fair.",
        candidates: [
          C(
            "spk-1",
            "Yusuf Abdulazeez Musa",
            "English",
            400,
            "Meetings that start on time, with agendas shared three days in advance.",
            [
              "Agendas shared 3 days ahead",
              "Livestream every general meeting",
              "Clear speaking rules for all members",
            ],
          ),
          C(
            "spk-2",
            "Musa Ibrahim",
            "Urban Planning",
            300,
            "A neutral chair, published minutes within 24 hours, and open petitions.",
            [
              "Minutes within 24 hours",
              "Student petitions with 200 signatures get a hearing",
              "Neutral, timed debates",
            ],
          ),
          {
            name: "Daniel Ekong Udo",
            dept: "Physics",
            level: 400,
            manifesto: "Orderly, transparent sessions where every student rep is heard and every vote is recorded.",
            platform: [
              "Publish minutes of every union congress within 72 hours",
              "Enforce speaking-time limits for fair debate",
              "Open the floor to student petitions each session",
            ],
          },
          {
            name: "Fatima Bello",
            dept: "Mathematics",
            level: 300,
            manifesto: "A speaker's office that trains reps to represent, not just attend.",
            platform: [
              "Termly training workshop for class and department reps",
              "Attendance and participation scorecard for reps",
              "Simplify the process for tabling new motions",
            ],
          },
          {
            name: "Uche Anyanwu",
            dept: "Electrical Engineering",
            level: 400,
            manifesto: "Debate that means something — structured sessions, clear rules, and real outcomes.",
            platform: [
              "Introduce a formal code of conduct for congress debates",
              "Create a public motions tracker showing status and outcomes",
              "Termly review of the union's constitution",
            ],
          },
          {
            name: "Grace Effiong",
            dept: "Sociology",
            level: 300,
            manifesto: "Make union sessions accessible — livestreamed, summarized, and open for questions.",
            platform: [
              "Live-tweet and summarize every congress session",
              "Q&A segment for students at the end of each meeting",
              "Translate key resolutions into plain-language bulletins",
            ],
          }
        ],
      },
      {
        id: "deputy-speaker",
        name: "Deputy Speaker",
        description: "Manages Student Union funds and reports on spending.",
        candidates: [
          {
            name: "Segun Aluko",
            dept: "Computer Science",
            level: 300,
            manifesto: "Support the speaker, serve the reps — a deputy who keeps the machinery running smoothly.",
            platform: [
              "Manage a shared calendar of all committee meetings",
              "Backup training for reps on procedure and motions",
              "Coordinate cross-department rep communication",
            ],
          },
          {
            name: "Maryam Aisha Sani",
            dept: "Biochemistry",
            level: 400,
            manifesto: "Bridging faculties — a deputy speaker who makes sure smaller departments aren't drowned out.",
            platform: [
              "Guarantee floor time for reps from smaller faculties",
              "Rotating deputy chair for sub-committee meetings",
              "Termly faculty roundtable hosted by the deputy's office",
            ],
          },
          {
            name: "Yusuf Garba",
            dept: "Architecture",
            level: 300,
            manifesto: "Efficiency in governance — streamlined agendas and no wasted sessions.",
            platform: [
              "Standardize agenda templates for faster meetings",
              "Cap session length with a strict agenda timer",
              "Digital archive of all past resolutions",
            ],
          },
          {
            name: "Cynthia Okonjo",
            dept: "Accounting",
            level: 400,
            manifesto: "A deputy who listens first — regular office hours for reps and students alike.",
            platform: [
              "Weekly open office hours for reps and students",
              "Anonymous suggestion box reviewed at every session",
              "Mediate disputes between reps before they reach congress",
            ],
          }
        ]
      },
      {
        id: "treasurer",
        name: "Treasurer",
        description: "Manages Student Union funds and reports on spending.",
        candidates: [
          {
            name: "chukwuebuka Eze",
            dept: "Accounting",
            level: 400,
            manifesto: "Every kobo accounted for — full transparency on union finances, term by term.",
            platform: [
              "Publish a detailed financial report every term",
              "Independent audit of union accounts each year",
              "Online dashboard showing real-time union spending",
            ],
          },
          {
            name: "Halima Suleiman",
            dept: "Biochemistry",
            level: 300,
            manifesto: "Smarter budgeting for a union that gets more value from every fee collected.",
            platform: [
              "Zero-based budgeting for all union committees",
              "Cut wasteful spending on non-essential events",
              "Student vote on allocation of discretionary funds",
            ],
          },
          {
            name: "Peter Okoye",
            dept: "Economics",
            level: 400,
            manifesto: "Building reserves, not just spending them — financial stability for future union leadership.",
            platform: [
              "Establish an emergency student welfare fund",
              "Multi-year financial planning, not just termly budgets",
              "Vendor cost comparisons for all union purchases",
            ],
          },
          {
            name: "Rita Ogunleye",
            dept: "Accounting",
            level: 300,
            manifesto: "A treasurer's office students can actually question — open books, open Q&A.",
            platform: [
              "Monthly finance Q&A open to all students",
              "Receipts and invoices published for major expenses",
              "Simplify the reimbursement process for club funding",
            ],
          }
        ],
      },
      {
        id: "social-director",
        name: "Social Director",
        description: "Plans campus events, festivals and student traditions.",
        candidates: [
          C(
            "soc-1",
            "Zainab Yusuf",
            "Mass Communication",
            200,
            "More affordable events, a welcome fair for every new intake, and a campus film night.",
            [
              "Ticket prices capped",
              "Welcome fair each September",
              "Monthly film night",
            ],
          ),
          C(
            "soc-2",
            "Bello Issa",
            "Chemical Engineering",
            300,
            "A live music series, an open-air stage, and events accessible to every student.",
            [
              "Open-air stage on the main quad",
              "Weekly live music series",
              "Step-free access at every event",
            ],
          ),
          {
            name: "Tunde Bakare",
            dept: "Mechanical Engineering",
            level: 300,
            manifesto: "Bigger, better, more inclusive events — something for every student, every term.",
            platform: [
              "Termly cross-faculty cultural festival",
              "Free entry to at least two major events per term",
              "Dedicated budget for club and society events",
            ],
          },
          {
            name: "Chiamaka Okeke",
            dept: "Architecture",
            level: 400,
            manifesto: "Campus life that reflects who we are — creative, diverse, and student-led.",
            platform: [
              "Student-curated arts and culture week",
              "Support fund for student-organized events",
              "Partner with local artists for campus showcases",
            ],
          },
          {
            name: "Damilola Fashola",
            dept: "Libary and Information Systems",
            level: 300,
            manifesto: "More than parties — sports, fitness, and wellness events for the whole student body.",
            platform: [
              "Inter-faculty sports tournament every semester",
              "Free fitness classes during exam season",
              "Wellness fair with mental health resources",
            ],
          },
          {
            name: "Zainab Aliyu",
            dept: "Mass Communication",
            level: 400,
            manifesto: "Events that don't break the bank — affordable fun without cutting corners.",
            platform: [
              "Negotiate discounted vendor rates for union events",
              "Free or subsidized tickets for low-income students",
              "Post-event surveys to improve future planning",
            ],
          }
        ],
      },
    ]
  }
)

export const ict2026 = (sessionId: string) => ({
  id: "fac-ict",
  title: "Faculty of Information and Communication Technology Representative Election 2026",
  session: sessionId,
  scopeType: ScopeType.FACULTY,
  scopeValue: 'Faculty of Information and Communication Technology',
  startsAt: new Date('2026-09-18T08:00:00'),
  endsAt: new Date('2026-10-08T17:00:00'),
  status: ElectionStatus.ACTIVE,
  description:
    "Elect the students who speak for the Faculty of ICT in faculty board meetings.",
  about:
    "This election allows students in the Faculty of ICT to choose their representatives on the faculty board.",
  positionName: [
    "Faculty Representative",

  ],
  positions: [
    {
      id: "fac-rep",
      name: "Faculty Representative",
      description: "Represents science students on the faculty board.",
      candidates: [
        C(
          "fr-1",
          "Grace Thompson",
          "Physics",
          300,
          "Regular student surveys and a public log of every issue raised.",
          ["Termly student survey", "Public issue tracker"],
        ),
        C(
          "fr-2",
          "Samuel Adeyi",
          "Chemistry",
          400,
          "Faster lab safety fixes and more practical hours.",
          ["Lab safety review", "More practical hours"],
        ),
      ],
    },
    {
      id: "fac-sec",
      name: "Faculty Secretary",
      description: "Keeps records and communicates decisions to students.",
      candidates: [
        C(
          "fs-1",
          "Biola Moreau",
          "Mathematics",
          300,
          "Clear summaries after every faculty meeting.",
          ["One-page meeting summaries"],
        ),
        C(
          "fs-2",
          "Bola Akande",
          "Computer Science",
          200,
          "A single notice channel for all faculty announcements.",
          ["One notice channel"],
        ),
      ],
    },
  ],
}) 