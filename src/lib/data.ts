// ---------------------------------------------------------------------------
// Type definitions (inferred from the field descriptions provided — adjust
// to match your real `pollDataType` interface if it differs).
// ---------------------------------------------------------------------------

type PollVisibility = "Public" | "Private" | "Unlisted";
type VotingRestriction =
    | "Anyone"
    | "Registered"
    | "Invited"
    | "Domain"
    | "Wallet"
    | "Token";
type PollType = "Options" | "Candidate";

interface PollOption {
    label: string;
    image: string;
}

interface Candidate {
    id: string;
    name: string;
    profile: string;
    candidateImage: string;
    DOB: string;
    partyName: string;
    partyImage: string;
}

interface pollDataType {
    id: string;
    title: string;
    description: string;
    pollType: PollType;
    coverImage: string;
    visibility: PollVisibility;
    votingRestriction: VotingRestriction;
    anonymousVoting: boolean;
    allowVoteChanges: boolean;
    startDate: string;
    endDate: string;
    createdBy: string;
    createdAt: string;
    options?: PollOption[];
    candidates?: Candidate[];
}

// ---------------------------------------------------------------------------
// Mock data — 20 polls total (10 "Options", 10 "Candidate")
// ---------------------------------------------------------------------------

const mockPolls: pollDataType[] = [
    // ============================== OPTIONS POLLS ==============================

    // 1. Politics
    {
        id: "poll_01",
        title: "Springfield City Council: 2027 Budget Priorities",
        description:
            "Help the city council decide which initiative should receive the largest share of next year's municipal budget.",
        pollType: "Options",
        coverImage: "https://placehold.co/800x400?text=City+Budget+Priorities",
        visibility: "Public",
        votingRestriction: "Domain",
        anonymousVoting: false,
        allowVoteChanges: true,
        startDate: "2026-07-01T08:00:00.000Z",
        endDate: "2026-07-15T20:00:00.000Z",
        createdBy: "Springfield City Clerk's Office",
        createdAt: "2026-06-20T09:00:00.000Z",
        options: [
            { label: "Road & Infrastructure Repair", image: "https://placehold.co/300x200?text=Roads" },
            { label: "Public Park Renovations", image: "https://placehold.co/300x200?text=Parks" },
            { label: "Affordable Housing Fund", image: "https://placehold.co/300x200?text=Housing" },
            { label: "Community Policing Programs", image: "https://placehold.co/300x200?text=Policing" },
            { label: "Public Library Expansion", image: "https://placehold.co/300x200?text=Library" },
        ],
    },

    // 2. Education
    {
        id: "poll_02",
        title: "Lincoln High School: New Elective Course for 2027",
        description:
            "Students and parents vote on which elective course should be introduced next academic year.",
        pollType: "Options",
        coverImage: "https://placehold.co/800x400?text=New+Elective+Course",
        visibility: "Private",
        votingRestriction: "Registered",
        anonymousVoting: true,
        allowVoteChanges: false,
        startDate: "2026-08-10T07:00:00.000Z",
        endDate: "2026-08-24T23:59:00.000Z",
        createdBy: "Lincoln High School Administration",
        createdAt: "2026-08-01T10:00:00.000Z",
        options: [
            { label: "Introduction to Robotics", image: "https://placehold.co/300x200?text=Robotics" },
            { label: "Creative Writing Workshop", image: "https://placehold.co/300x200?text=Writing" },
            { label: "Personal Finance 101", image: "https://placehold.co/300x200?text=Finance" },
            { label: "Digital Photography", image: "https://placehold.co/300x200?text=Photography" },
        ],
    },

    // 3. Technology
    {
        id: "poll_03",
        title: "NimbusCloud: Next Quarter Feature Vote",
        description:
            "Help our product team prioritize which feature should be built in the upcoming development quarter.",
        pollType: "Options",
        coverImage: "https://placehold.co/800x400?text=Feature+Roadmap+Vote",
        visibility: "Unlisted",
        votingRestriction: "Invited",
        anonymousVoting: false,
        allowVoteChanges: true,
        startDate: "2026-09-05T09:00:00.000Z",
        endDate: "2026-09-19T18:00:00.000Z",
        createdBy: "NimbusCloud Product Team",
        createdAt: "2026-08-28T12:00:00.000Z",
        options: [
            { label: "Dark Mode UI", image: "https://placehold.co/300x200?text=Dark+Mode" },
            { label: "Real-time Collaboration", image: "https://placehold.co/300x200?text=Collaboration" },
            { label: "Offline Sync", image: "https://placehold.co/300x200?text=Offline+Sync" },
            { label: "API Rate Limit Dashboard", image: "https://placehold.co/300x200?text=API+Dashboard" },
            { label: "Two-Factor Authentication", image: "https://placehold.co/300x200?text=2FA" },
            { label: "Custom Webhooks", image: "https://placehold.co/300x200?text=Webhooks" },
        ],
    },

    // 4. Entertainment
    {
        id: "poll_04",
        title: "Office Movie Night: Pick This Month's Film",
        description:
            "Cast your vote for the film we'll screen at this month's company movie night in the break room.",
        pollType: "Options",
        coverImage: "https://placehold.co/800x400?text=Movie+Night",
        visibility: "Public",
        votingRestriction: "Anyone",
        anonymousVoting: true,
        allowVoteChanges: true,
        startDate: "2026-06-23T08:00:00.000Z",
        endDate: "2026-06-27T17:00:00.000Z",
        createdBy: "Social Committee",
        createdAt: "2026-06-18T11:00:00.000Z",
        options: [
            { label: "The Last Voyage (Sci-Fi)", image: "https://placehold.co/300x200?text=Last+Voyage" },
            { label: "Midnight in Paris Revisited (Comedy-Drama)", image: "https://placehold.co/300x200?text=Midnight+Paris" },
            { label: "Shadow Protocol (Action Thriller)", image: "https://placehold.co/300x200?text=Shadow+Protocol" },
            { label: "Whispering Pines (Mystery)", image: "https://placehold.co/300x200?text=Whispering+Pines" },
        ],
    },

    // 5. Sports
    {
        id: "poll_05",
        title: "Riverside Community Olympics: Choose the New Sport",
        description:
            "Vote for the new sporting event to be added to this year's Riverside Community Olympics roster.",
        pollType: "Options",
        coverImage: "https://placehold.co/800x400?text=Community+Olympics",
        visibility: "Public",
        votingRestriction: "Anyone",
        anonymousVoting: false,
        allowVoteChanges: false,
        startDate: "2026-07-20T06:00:00.000Z",
        endDate: "2026-08-01T22:00:00.000Z",
        createdBy: "Riverside Parks & Recreation",
        createdAt: "2026-07-10T08:00:00.000Z",
        options: [
            { label: "Pickleball", image: "https://placehold.co/300x200?text=Pickleball" },
            { label: "Ultimate Frisbee", image: "https://placehold.co/300x200?text=Ultimate+Frisbee" },
            { label: "Badminton", image: "https://placehold.co/300x200?text=Badminton" },
        ],
    },

    // 6. Workplace
    {
        id: "poll_06",
        title: "TechNova Inc.: Annual Offsite Location",
        description:
            "Help People Ops choose the destination for this year's company-wide offsite retreat.",
        pollType: "Options",
        coverImage: "https://placehold.co/800x400?text=Annual+Offsite",
        visibility: "Private",
        votingRestriction: "Domain",
        anonymousVoting: false,
        allowVoteChanges: true,
        startDate: "2026-10-01T09:00:00.000Z",
        endDate: "2026-10-10T18:00:00.000Z",
        createdBy: "TechNova People Operations",
        createdAt: "2026-09-22T10:00:00.000Z",
        options: [
            { label: "Lake Tahoe Retreat", image: "https://placehold.co/300x200?text=Lake+Tahoe" },
            { label: "Coastal Resort in San Diego", image: "https://placehold.co/300x200?text=San+Diego" },
            { label: "Mountain Lodge in Aspen", image: "https://placehold.co/300x200?text=Aspen" },
            { label: "City Getaway in Austin", image: "https://placehold.co/300x200?text=Austin" },
            { label: "Vineyard Retreat in Napa Valley", image: "https://placehold.co/300x200?text=Napa+Valley" },
        ],
    },

    // 7. Community
    {
        id: "poll_07",
        title: "Greenfield Neighborhood Park Redesign",
        description:
            "Residents vote on the centerpiece feature for the upcoming redesign of Greenfield Community Park.",
        pollType: "Options",
        coverImage: "https://placehold.co/800x400?text=Park+Redesign",
        visibility: "Public",
        votingRestriction: "Anyone",
        anonymousVoting: true,
        allowVoteChanges: true,
        startDate: "2026-07-05T08:00:00.000Z",
        endDate: "2026-07-26T20:00:00.000Z",
        createdBy: "Greenfield Neighborhood Association",
        createdAt: "2026-06-29T09:30:00.000Z",
        options: [
            { label: "Splash Pad & Water Features", image: "https://placehold.co/300x200?text=Splash+Pad" },
            { label: "Skate Park Expansion", image: "https://placehold.co/300x200?text=Skate+Park" },
            { label: "Community Garden Plots", image: "https://placehold.co/300x200?text=Garden+Plots" },
            { label: "Outdoor Amphitheater", image: "https://placehold.co/300x200?text=Amphitheater" },
        ],
    },

    // 8. Technology / Community (Hackathon)
    {
        id: "poll_08",
        title: "Innovate Labs Hackathon: Choose This Year's Theme",
        description:
            "Vote for the theme that will guide this year's Innovate Labs annual hackathon challenge.",
        pollType: "Options",
        coverImage: "https://placehold.co/800x400?text=Hackathon+Theme",
        visibility: "Unlisted",
        votingRestriction: "Token",
        anonymousVoting: false,
        allowVoteChanges: false,
        startDate: "2026-09-01T07:00:00.000Z",
        endDate: "2026-09-08T23:59:00.000Z",
        createdBy: "Innovate Labs Events Team",
        createdAt: "2026-08-20T13:00:00.000Z",
        options: [
            { label: "Climate Tech Solutions", image: "https://placehold.co/300x200?text=Climate+Tech" },
            { label: "Healthcare Accessibility", image: "https://placehold.co/300x200?text=Healthcare" },
            { label: "Financial Inclusion Tools", image: "https://placehold.co/300x200?text=Fin+Inclusion" },
        ],
    },

    // 9. Environment / Workplace
    {
        id: "poll_09",
        title: "TechNova Inc.: 2027 Sustainability Initiative",
        description:
            "Employees vote on which sustainability initiative the company should fund and roll out next year.",
        pollType: "Options",
        coverImage: "https://placehold.co/800x400?text=Sustainability+Vote",
        visibility: "Private",
        votingRestriction: "Registered",
        anonymousVoting: true,
        allowVoteChanges: true,
        startDate: "2026-11-03T08:00:00.000Z",
        endDate: "2026-11-17T18:00:00.000Z",
        createdBy: "TechNova Sustainability Committee",
        createdAt: "2026-10-25T09:00:00.000Z",
        options: [
            { label: "Solar Panel Installation", image: "https://placehold.co/300x200?text=Solar+Panels" },
            { label: "Electric Vehicle Charging Stations", image: "https://placehold.co/300x200?text=EV+Charging" },
            { label: "Zero-Waste Cafeteria Program", image: "https://placehold.co/300x200?text=Zero+Waste" },
            { label: "Company-wide Carbon Offset Fund", image: "https://placehold.co/300x200?text=Carbon+Offset" },
        ],
    },

    // 10. Entertainment / Music
    {
        id: "poll_10",
        title: "Sunburst Music Festival: Vote for the Headliner Genre",
        description:
            "Festival-goers vote on which musical genre should headline next year's Sunburst Music Festival.",
        pollType: "Options",
        coverImage: "https://placehold.co/800x400?text=Sunburst+Festival",
        visibility: "Public",
        votingRestriction: "Wallet",
        anonymousVoting: false,
        allowVoteChanges: true,
        startDate: "2026-12-01T06:00:00.000Z",
        endDate: "2026-12-15T22:00:00.000Z",
        createdBy: "Sunburst Festival Organizers",
        createdAt: "2026-11-20T10:00:00.000Z",
        options: [
            { label: "Indie Rock", image: "https://placehold.co/300x200?text=Indie+Rock" },
            { label: "Electronic Dance", image: "https://placehold.co/300x200?text=EDM" },
            { label: "Hip-Hop", image: "https://placehold.co/300x200?text=Hip-Hop" },
            { label: "Folk & Acoustic", image: "https://placehold.co/300x200?text=Folk" },
            { label: "Latin Pop", image: "https://placehold.co/300x200?text=Latin+Pop" },
        ],
    },

    // ============================== CANDIDATE POLLS ==============================

    // 11. Politics - Mayoral
    {
        id: "poll_11",
        title: "Springfield Mayoral Election 2027",
        description:
            "Cast your vote for the next Mayor of Springfield in the upcoming municipal election.",
        pollType: "Candidate",
        coverImage: "https://placehold.co/800x400?text=Mayoral+Election",
        visibility: "Public",
        votingRestriction: "Registered",
        anonymousVoting: true,
        allowVoteChanges: false,
        startDate: "2027-03-01T07:00:00.000Z",
        endDate: "2027-03-02T19:00:00.000Z",
        createdBy: "Springfield Board of Elections",
        createdAt: "2026-12-15T09:00:00.000Z",
        candidates: [
            {
                id: "cand_01",
                name: "Eleanor Vance",
                profile:
                    "Two-term city councilwoman focused on affordable housing and small business growth.",
                candidateImage: "https://placehold.co/200x200?text=Eleanor+Vance",
                DOB: "1978-04-12T00:00:00.000Z",
                partyName: "Progressive Alliance",
                partyImage: "https://placehold.co/120x120?text=PA",
            },
            {
                id: "cand_02",
                name: "Marcus Whitfield",
                profile:
                    "Former police chief campaigning on public safety reform and infrastructure investment.",
                candidateImage: "https://placehold.co/200x200?text=Marcus+Whitfield",
                DOB: "1971-09-03T00:00:00.000Z",
                partyName: "Civic Unity Party",
                partyImage: "https://placehold.co/120x120?text=CUP",
            },
            {
                id: "cand_03",
                name: "Dana Okafor",
                profile:
                    "Local entrepreneur and community organizer running on a platform of economic revitalization.",
                candidateImage: "https://placehold.co/200x200?text=Dana+Okafor",
                DOB: "1984-01-27T00:00:00.000Z",
                partyName: "Independent",
                partyImage: "https://placehold.co/120x120?text=IND",
            },
            {
                id: "cand_04",
                name: "Felix Romero",
                profile:
                    "Environmental lawyer advocating for green infrastructure and renewable energy jobs.",
                candidateImage: "https://placehold.co/200x200?text=Felix+Romero",
                DOB: "1980-06-18T00:00:00.000Z",
                partyName: "Green Future Party",
                partyImage: "https://placehold.co/120x120?text=GFP",
            },
            {
                id: "cand_05",
                name: "Priya Anand",
                profile:
                    "School board veteran focused on education funding and youth employment programs.",
                candidateImage: "https://placehold.co/200x200?text=Priya+Anand",
                DOB: "1976-11-09T00:00:00.000Z",
                partyName: "People First Coalition",
                partyImage: "https://placehold.co/120x120?text=PFC",
            },
        ],
    },

    // 12. Education - Student Council President
    {
        id: "poll_12",
        title: "Lincoln High School Student Council President Election",
        description:
            "Lincoln High School students vote to elect their next Student Council President.",
        pollType: "Candidate",
        coverImage: "https://placehold.co/800x400?text=Student+Council+Election",
        visibility: "Private",
        votingRestriction: "Registered",
        anonymousVoting: true,
        allowVoteChanges: true,
        startDate: "2026-09-14T08:00:00.000Z",
        endDate: "2026-09-16T15:00:00.000Z",
        createdBy: "Lincoln High School Student Government",
        createdAt: "2026-09-01T10:00:00.000Z",
        candidates: [
            {
                id: "cand_06",
                name: "Jordan Mills",
                profile: "Junior class representative pushing for extended library hours and a campus app.",
                candidateImage: "https://placehold.co/200x200?text=Jordan+Mills",
                DOB: "2009-05-14T00:00:00.000Z",
                partyName: "Unity Slate",
                partyImage: "https://placehold.co/120x120?text=Unity",
            },
            {
                id: "cand_07",
                name: "Amara Chen",
                profile: "Debate team captain campaigning for more mental health resources on campus.",
                candidateImage: "https://placehold.co/200x200?text=Amara+Chen",
                DOB: "2009-02-22T00:00:00.000Z",
                partyName: "Forward Together",
                partyImage: "https://placehold.co/120x120?text=FT",
            },
            {
                id: "cand_08",
                name: "Tyler Brooks",
                profile: "Varsity athlete promoting better facilities and inter-club collaboration.",
                candidateImage: "https://placehold.co/200x200?text=Tyler+Brooks",
                DOB: "2008-12-30T00:00:00.000Z",
                partyName: "Student First",
                partyImage: "https://placehold.co/120x120?text=SF",
            },
            {
                id: "cand_09",
                name: "Sofia Ramirez",
                profile: "Arts club president advocating for expanded creative programs and showcases.",
                candidateImage: "https://placehold.co/200x200?text=Sofia+Ramirez",
                DOB: "2009-07-08T00:00:00.000Z",
                partyName: "Bright Future",
                partyImage: "https://placehold.co/120x120?text=BF",
            },
        ],
    },

    // 13. Workplace - Employee of the Year
    {
        id: "poll_13",
        title: "TechNova Inc. Employee of the Year 2026",
        description:
            "TechNova staff vote to recognize the colleague who best embodied company values this year.",
        pollType: "Candidate",
        coverImage: "https://placehold.co/800x400?text=Employee+of+the+Year",
        visibility: "Private",
        votingRestriction: "Domain",
        anonymousVoting: false,
        allowVoteChanges: false,
        startDate: "2026-12-01T08:00:00.000Z",
        endDate: "2026-12-10T18:00:00.000Z",
        createdBy: "TechNova People Operations",
        createdAt: "2026-11-20T09:00:00.000Z",
        candidates: [
            {
                id: "cand_10",
                name: "Lena Kim",
                profile: "Senior backend engineer who led the platform migration with zero downtime.",
                candidateImage: "https://placehold.co/200x200?text=Lena+Kim",
                DOB: "1992-03-19T00:00:00.000Z",
                partyName: "Engineering",
                partyImage: "https://placehold.co/120x120?text=ENG",
            },
            {
                id: "cand_11",
                name: "Omar Siddiqui",
                profile: "Top-performing account executive who closed the largest enterprise deal of the year.",
                candidateImage: "https://placehold.co/200x200?text=Omar+Siddiqui",
                DOB: "1989-08-25T00:00:00.000Z",
                partyName: "Sales",
                partyImage: "https://placehold.co/120x120?text=SALES",
            },
            {
                id: "cand_12",
                name: "Grace Thompson",
                profile: "Marketing lead behind the rebrand campaign that doubled inbound traffic.",
                candidateImage: "https://placehold.co/200x200?text=Grace+Thompson",
                DOB: "1990-12-02T00:00:00.000Z",
                partyName: "Marketing",
                partyImage: "https://placehold.co/120x120?text=MKT",
            },
            {
                id: "cand_13",
                name: "Diego Fernandez",
                profile: "Customer success manager with the highest client retention rate company-wide.",
                candidateImage: "https://placehold.co/200x200?text=Diego+Fernandez",
                DOB: "1987-05-30T00:00:00.000Z",
                partyName: "Customer Success",
                partyImage: "https://placehold.co/120x120?text=CS",
            },
            {
                id: "cand_14",
                name: "Naomi Park",
                profile: "Product manager who shipped three major releases ahead of schedule this year.",
                candidateImage: "https://placehold.co/200x200?text=Naomi+Park",
                DOB: "1991-10-11T00:00:00.000Z",
                partyName: "Product",
                partyImage: "https://placehold.co/120x120?text=PROD",
            },
        ],
    },

    // 14. Sports - Team Captain
    {
        id: "poll_14",
        title: "Riverside FC Team Captain Election",
        description:
            "Riverside FC club members vote to elect the team captain for the upcoming season.",
        pollType: "Candidate",
        coverImage: "https://placehold.co/800x400?text=Team+Captain+Election",
        visibility: "Public",
        votingRestriction: "Invited",
        anonymousVoting: false,
        allowVoteChanges: true,
        startDate: "2026-07-28T09:00:00.000Z",
        endDate: "2026-07-31T20:00:00.000Z",
        createdBy: "Riverside FC Club Management",
        createdAt: "2026-07-20T08:00:00.000Z",
        candidates: [
            {
                id: "cand_15",
                name: "Carlos Mendoza",
                profile: "Five-year club veteran known for his leadership and defensive consistency.",
                candidateImage: "https://placehold.co/200x200?text=Carlos+Mendoza",
                DOB: "1996-02-14T00:00:00.000Z",
                partyName: "Defender",
                partyImage: "https://placehold.co/120x120?text=DEF",
            },
            {
                id: "cand_16",
                name: "Liam O'Connor",
                profile: "Creative midfielder and the club's top assist provider last season.",
                candidateImage: "https://placehold.co/200x200?text=Liam+O+Connor",
                DOB: "1998-06-21T00:00:00.000Z",
                partyName: "Midfielder",
                partyImage: "https://placehold.co/120x120?text=MID",
            },
            {
                id: "cand_17",
                name: "Yuki Tanaka",
                profile: "Top scorer for two consecutive seasons with a reputation for clutch goals.",
                candidateImage: "https://placehold.co/200x200?text=Yuki+Tanaka",
                DOB: "1997-09-05T00:00:00.000Z",
                partyName: "Forward",
                partyImage: "https://placehold.co/120x120?text=FWD",
            },
            {
                id: "cand_18",
                name: "Ben Okoye",
                profile: "Club's starting goalkeeper, holder of the season's clean sheet record.",
                candidateImage: "https://placehold.co/200x200?text=Ben+Okoye",
                DOB: "1995-11-30T00:00:00.000Z",
                partyName: "Goalkeeper",
                partyImage: "https://placehold.co/120x120?text=GK",
            },
        ],
    },

    // 15. Community - Garden Coordinator
    {
        id: "poll_15",
        title: "Greenfield Community Garden Coordinator Election",
        description:
            "Garden plot holders vote to elect the volunteer coordinator for the Greenfield Community Garden.",
        pollType: "Candidate",
        coverImage: "https://placehold.co/800x400?text=Garden+Coordinator",
        visibility: "Public",
        votingRestriction: "Anyone",
        anonymousVoting: true,
        allowVoteChanges: true,
        startDate: "2026-08-15T07:00:00.000Z",
        endDate: "2026-08-22T19:00:00.000Z",
        createdBy: "Greenfield Community Garden Association",
        createdAt: "2026-08-05T10:00:00.000Z",
        candidates: [
            {
                id: "cand_19",
                name: "Helena Brooks",
                profile: "Master gardener who has organized seasonal plantings for the past three years.",
                candidateImage: "https://placehold.co/200x200?text=Helena+Brooks",
                DOB: "1965-04-17T00:00:00.000Z",
                partyName: "Garden Volunteers Group",
                partyImage: "https://placehold.co/120x120?text=GVG",
            },
            {
                id: "cand_20",
                name: "Tobias Reed",
                profile: "Urban agriculture advocate focused on composting and water conservation.",
                candidateImage: "https://placehold.co/200x200?text=Tobias+Reed",
                DOB: "1979-01-09T00:00:00.000Z",
                partyName: "Urban Greening Society",
                partyImage: "https://placehold.co/120x120?text=UGS",
            },
            {
                id: "cand_21",
                name: "Mei Lin",
                profile: "Retired botanist offering workshops on native and pollinator-friendly plants.",
                candidateImage: "https://placehold.co/200x200?text=Mei+Lin",
                DOB: "1958-10-23T00:00:00.000Z",
                partyName: "Neighborhood Growers",
                partyImage: "https://placehold.co/120x120?text=NG",
            },
            {
                id: "cand_22",
                name: "Patrick Sullivan",
                profile: "Local teacher running school field trips and youth gardening programs.",
                candidateImage: "https://placehold.co/200x200?text=Patrick+Sullivan",
                DOB: "1983-07-12T00:00:00.000Z",
                partyName: "Community Harvest Initiative",
                partyImage: "https://placehold.co/120x120?text=CHI",
            },
        ],
    },

    // 16. Politics - National Parliamentary
    {
        id: "poll_16",
        title: "National Parliamentary Election – District 12",
        description:
            "Registered voters in District 12 cast their ballot for their next parliamentary representative.",
        pollType: "Candidate",
        coverImage: "https://placehold.co/800x400?text=District+12+Election",
        visibility: "Public",
        votingRestriction: "Registered",
        anonymousVoting: true,
        allowVoteChanges: false,
        startDate: "2027-05-04T06:00:00.000Z",
        endDate: "2027-05-05T20:00:00.000Z",
        createdBy: "National Electoral Commission",
        createdAt: "2027-02-10T09:00:00.000Z",
        candidates: [
            {
                id: "cand_23",
                name: "Robert Hale",
                profile: "Incumbent representative focused on agricultural subsidies and rural broadband.",
                candidateImage: "https://placehold.co/200x200?text=Robert+Hale",
                DOB: "1968-03-08T00:00:00.000Z",
                partyName: "National Reform Party",
                partyImage: "https://placehold.co/120x120?text=NRP",
            },
            {
                id: "cand_24",
                name: "Aisha Bello",
                profile: "Civil rights attorney campaigning for healthcare access and judicial reform.",
                candidateImage: "https://placehold.co/200x200?text=Aisha+Bello",
                DOB: "1982-06-29T00:00:00.000Z",
                partyName: "Liberty Coalition",
                partyImage: "https://placehold.co/120x120?text=LC",
            },
            {
                id: "cand_25",
                name: "Henrik Voss",
                profile: "Former union organizer running on labor protections and minimum wage reform.",
                candidateImage: "https://placehold.co/200x200?text=Henrik+Voss",
                DOB: "1974-12-15T00:00:00.000Z",
                partyName: "Workers United Front",
                partyImage: "https://placehold.co/120x120?text=WUF",
            },
            {
                id: "cand_26",
                name: "Isabella Cruz",
                profile: "Climate scientist advocating for renewable energy transition policy.",
                candidateImage: "https://placehold.co/200x200?text=Isabella+Cruz",
                DOB: "1985-09-02T00:00:00.000Z",
                partyName: "Green Horizon Party",
                partyImage: "https://placehold.co/120x120?text=GHP",
            },
            {
                id: "cand_27",
                name: "David Chen",
                profile: "Economist proposing tax reform and small business growth incentives.",
                candidateImage: "https://placehold.co/200x200?text=David+Chen",
                DOB: "1977-04-20T00:00:00.000Z",
                partyName: "Centrist Alliance",
                partyImage: "https://placehold.co/120x120?text=CA",
            },
            {
                id: "cand_28",
                name: "Fatima Al-Sayed",
                profile: "Community organizer running independently on transparency and local governance.",
                candidateImage: "https://placehold.co/200x200?text=Fatima+Al-Sayed",
                DOB: "1981-11-11T00:00:00.000Z",
                partyName: "Independent Voices",
                partyImage: "https://placehold.co/120x120?text=IV",
            },
        ],
    },

    // 17. Education - University Student Union
    {
        id: "poll_17",
        title: "Oakridge University Student Union President Election",
        description:
            "Oakridge University students vote to elect the next Student Union President.",
        pollType: "Candidate",
        coverImage: "https://placehold.co/800x400?text=Student+Union+Election",
        visibility: "Unlisted",
        votingRestriction: "Domain",
        anonymousVoting: false,
        allowVoteChanges: true,
        startDate: "2026-10-12T08:00:00.000Z",
        endDate: "2026-10-14T20:00:00.000Z",
        createdBy: "Oakridge University Student Union",
        createdAt: "2026-09-30T09:00:00.000Z",
        candidates: [
            {
                id: "cand_29",
                name: "Ethan Walsh",
                profile: "Senior majoring in political science, focused on lowering textbook costs.",
                candidateImage: "https://placehold.co/200x200?text=Ethan+Walsh",
                DOB: "2004-02-17T00:00:00.000Z",
                partyName: "Campus First Slate",
                partyImage: "https://placehold.co/120x120?text=CFS",
            },
            {
                id: "cand_30",
                name: "Priya Deshmukh",
                profile: "International student advocate pushing for expanded mental health services.",
                candidateImage: "https://placehold.co/200x200?text=Priya+Deshmukh",
                DOB: "2003-08-09T00:00:00.000Z",
                partyName: "Unity & Action",
                partyImage: "https://placehold.co/120x120?text=UA",
            },
            {
                id: "cand_31",
                name: "Marcus Webb",
                profile: "Former dorm council head campaigning on housing affordability for students.",
                candidateImage: "https://placehold.co/200x200?text=Marcus+Webb",
                DOB: "2004-05-26T00:00:00.000Z",
                partyName: "Student Voice Coalition",
                partyImage: "https://placehold.co/120x120?text=SVC",
            },
            {
                id: "cand_32",
                name: "Chloe Bennett",
                profile: "Environmental science major running on campus sustainability initiatives.",
                candidateImage: "https://placehold.co/200x200?text=Chloe+Bennett",
                DOB: "2003-12-04T00:00:00.000Z",
                partyName: "Forward Oakridge",
                partyImage: "https://placehold.co/120x120?text=FO",
            },
            {
                id: "cand_33",
                name: "Ravi Kapoor",
                profile: "Disability rights advocate focused on campus accessibility improvements.",
                candidateImage: "https://placehold.co/200x200?text=Ravi+Kapoor",
                DOB: "2004-07-31T00:00:00.000Z",
                partyName: "Inclusive Campus Movement",
                partyImage: "https://placehold.co/120x120?text=ICM",
            },
        ],
    },

    // 18. Entertainment / Esports - MVP Award
    {
        id: "poll_18",
        title: "Stellar Esports League: Season 7 MVP Award",
        description:
            "Fans vote to crown the Most Valuable Player of the Stellar Esports League's seventh season.",
        pollType: "Candidate",
        coverImage: "https://placehold.co/800x400?text=Season+7+MVP",
        visibility: "Public",
        votingRestriction: "Anyone",
        anonymousVoting: false,
        allowVoteChanges: true,
        startDate: "2026-12-20T06:00:00.000Z",
        endDate: "2027-01-03T23:59:00.000Z",
        createdBy: "Stellar Esports League Officials",
        createdAt: "2026-12-10T08:00:00.000Z",
        candidates: [
            {
                id: "cand_34",
                name: "Kenji Sato",
                profile: "Frag-leader known for his clutch endgame performances all season.",
                candidateImage: "https://placehold.co/200x200?text=Kenji+Sato",
                DOB: "2000-03-15T00:00:00.000Z",
                partyName: "Phantom Vanguard",
                partyImage: "https://placehold.co/120x120?text=PV",
            },
            {
                id: "cand_35",
                name: "Marcus Lee",
                profile: "Support player with the league's highest assist rating this season.",
                candidateImage: "https://placehold.co/200x200?text=Marcus+Lee",
                DOB: "1999-07-22T00:00:00.000Z",
                partyName: "Crimson Wolves",
                partyImage: "https://placehold.co/120x120?text=CW",
            },
            {
                id: "cand_36",
                name: "Elena Petrova",
                profile: "Strategic shotcaller credited with three tournament-winning calls.",
                candidateImage: "https://placehold.co/200x200?text=Elena+Petrova",
                DOB: "2001-01-30T00:00:00.000Z",
                partyName: "Nova Strikers",
                partyImage: "https://placehold.co/120x120?text=NS",
            },
            {
                id: "cand_37",
                name: "Diego Alves",
                profile: "Defensive specialist with the lowest death rate in the league this season.",
                candidateImage: "https://placehold.co/200x200?text=Diego+Alves",
                DOB: "1998-09-11T00:00:00.000Z",
                partyName: "Iron Sentinels",
                partyImage: "https://placehold.co/120x120?text=IS",
            },
            {
                id: "cand_38",
                name: "Hannah Kim",
                profile: "Rookie sensation who broke the league's single-match scoring record.",
                candidateImage: "https://placehold.co/200x200?text=Hannah+Kim",
                DOB: "2003-04-05T00:00:00.000Z",
                partyName: "Shadow Legion",
                partyImage: "https://placehold.co/120x120?text=SL",
            },
            {
                id: "cand_39",
                name: "Tariq Johnson",
                profile: "Veteran captain leading his roster to a franchise-best playoff run.",
                candidateImage: "https://placehold.co/200x200?text=Tariq+Johnson",
                DOB: "1997-11-19T00:00:00.000Z",
                partyName: "Blaze Tactics",
                partyImage: "https://placehold.co/120x120?text=BT",
            },
            {
                id: "cand_40",
                name: "Lucas Meyer",
                profile: "Versatile flex player who topped the league in objective control.",
                candidateImage: "https://placehold.co/200x200?text=Lucas+Meyer",
                DOB: "2000-06-27T00:00:00.000Z",
                partyName: "Frost Guardians",
                partyImage: "https://placehold.co/120x120?text=FG",
            },
            {
                id: "cand_41",
                name: "Nadia Hassan",
                profile: "Aggressive entry fragger known for high-impact opening plays.",
                candidateImage: "https://placehold.co/200x200?text=Nadia+Hassan",
                DOB: "2002-02-08T00:00:00.000Z",
                partyName: "Apex Raptors",
                partyImage: "https://placehold.co/120x120?text=AR",
            },
        ],
    },

    // 19. Community / Nonprofit - Board Chairperson
    {
        id: "poll_19",
        title: "Hopewell Nonprofit Board Chairperson Election",
        description:
            "Hopewell Foundation members vote to elect the new Chairperson of the Board of Directors.",
        pollType: "Candidate",
        coverImage: "https://placehold.co/800x400?text=Board+Chairperson+Election",
        visibility: "Private",
        votingRestriction: "Invited",
        anonymousVoting: true,
        allowVoteChanges: false,
        startDate: "2026-11-10T08:00:00.000Z",
        endDate: "2026-11-14T18:00:00.000Z",
        createdBy: "Hopewell Foundation Governance Committee",
        createdAt: "2026-10-28T09:00:00.000Z",
        candidates: [
            {
                id: "cand_42",
                name: "Margaret Foster",
                profile: "20-year nonprofit leadership veteran who founded the foundation's outreach program.",
                candidateImage: "https://placehold.co/200x200?text=Margaret+Foster",
                DOB: "1962-05-04T00:00:00.000Z",
                partyName: "Hopewell Founders Circle",
                partyImage: "https://placehold.co/120x120?text=HFC",
            },
            {
                id: "cand_43",
                name: "Samuel Ortiz",
                profile: "Finance executive proposing a long-term endowment strategy for the foundation.",
                candidateImage: "https://placehold.co/200x200?text=Samuel+Ortiz",
                DOB: "1970-10-16T00:00:00.000Z",
                partyName: "Community Outreach Network",
                partyImage: "https://placehold.co/120x120?text=CON",
            },
            {
                id: "cand_44",
                name: "Wendy Park",
                profile: "Grant-writing specialist focused on expanding partnerships with local schools.",
                candidateImage: "https://placehold.co/200x200?text=Wendy+Park",
                DOB: "1975-01-21T00:00:00.000Z",
                partyName: "Future Forward Alliance",
                partyImage: "https://placehold.co/120x120?text=FFA",
            },
            {
                id: "cand_45",
                name: "Theo Bramwell",
                profile: "Longtime volunteer coordinator advocating for greater donor transparency.",
                candidateImage: "https://placehold.co/200x200?text=Theo+Bramwell",
                DOB: "1967-08-13T00:00:00.000Z",
                partyName: "Volunteer Voices",
                partyImage: "https://placehold.co/120x120?text=VV",
            },
        ],
    },

    // 20. Technology - Startup Founder of the Year
    {
        id: "poll_20",
        title: "Innovate Labs: Startup Founder of the Year 2026",
        description:
            "The Innovate Labs accelerator community votes to honor the standout founder of the year.",
        pollType: "Candidate",
        coverImage: "https://placehold.co/800x400?text=Founder+of+the+Year",
        visibility: "Public",
        votingRestriction: "Token",
        anonymousVoting: false,
        allowVoteChanges: true,
        startDate: "2026-12-05T07:00:00.000Z",
        endDate: "2026-12-19T20:00:00.000Z",
        createdBy: "Innovate Labs Accelerator",
        createdAt: "2026-11-25T10:00:00.000Z",
        candidates: [
            {
                id: "cand_46",
                name: "Sarah Whitman",
                profile: "Built a quantum-computing analytics tool that closed a Series A within a year.",
                candidateImage: "https://placehold.co/200x200?text=Sarah+Whitman",
                DOB: "1990-03-22T00:00:00.000Z",
                partyName: "Quantum Byte",
                partyImage: "https://placehold.co/120x120?text=QB",
            },
            {
                id: "cand_47",
                name: "Daniel Osei",
                profile: "Founded a battery-recycling startup now partnered with three major automakers.",
                candidateImage: "https://placehold.co/200x200?text=Daniel+Osei",
                DOB: "1988-07-09T00:00:00.000Z",
                partyName: "EcoCharge",
                partyImage: "https://placehold.co/120x120?text=EC",
            },
            {
                id: "cand_48",
                name: "Mei Chen",
                profile: "Created a remote-patient-monitoring platform now used in 200+ clinics.",
                candidateImage: "https://placehold.co/200x200?text=Mei+Chen",
                DOB: "1991-12-01T00:00:00.000Z",
                partyName: "MediSync",
                partyImage: "https://placehold.co/120x120?text=MS",
            },
            {
                id: "cand_49",
                name: "Carlos Vega",
                profile: "Launched a vertical-farming supply chain startup serving urban grocers.",
                candidateImage: "https://placehold.co/200x200?text=Carlos+Vega",
                DOB: "1986-04-28T00:00:00.000Z",
                partyName: "Urban Harvest",
                partyImage: "https://placehold.co/120x120?text=UH",
            },
            {
                id: "cand_50",
                name: "Anika Sharma",
                profile: "Built a micro-lending fintech app now serving over a million users.",
                candidateImage: "https://placehold.co/200x200?text=Anika+Sharma",
                DOB: "1989-09-17T00:00:00.000Z",
                partyName: "FinLeap",
                partyImage: "https://placehold.co/120x120?text=FL",
            },
            {
                id: "cand_51",
                name: "Jonah Pierce",
                profile: "Developed a neuro-feedback wearable now in clinical trials at five universities.",
                candidateImage: "https://placehold.co/200x200?text=Jonah+Pierce",
                DOB: "1992-02-14T00:00:00.000Z",
                partyName: "NeuroLink",
                partyImage: "https://placehold.co/120x120?text=NL",
            },
        ],
    },
];

export default mockPolls;
export type { pollDataType, PollOption, Candidate, PollVisibility, VotingRestriction, PollType };
