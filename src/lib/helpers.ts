export const cx = (...a: string[]) => a.filter(Boolean).join(" ");
export const BV = {
    primary: "bg-blue-700 text-white hover:bg-blue-800",
    secondary: "border border-blue-200 bg-white text-blue-800 hover:bg-blue-50",
    ghost: "bg-transparent text-blue-800 hover:bg-blue-50",
    danger: "bg-red-700 text-white hover:bg-red-800",
};




export const AVC = ["bg-blue-100 text-blue-900", "bg-green-100 text-green-900", "bg-amber-100 text-amber-900", "bg-violet-100 text-violet-900", "bg-rose-100 text-rose-900", "bg-cyan-100 text-cyan-900"];
export const AVS = { sm: "h-10 w-10 text-sm", md: "h-12 w-12 text-base", lg: "h-20 w-20 text-2xl" };
export const H1 = "font-serif text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-4xl";
export const H2 = "font-serif text-xl font-bold text-slate-900";
export const H3 = "text-base font-semibold text-slate-900";


export function matchRoute(path: string) {
    const [p, qs] = path.split("?"); const q = new URLSearchParams(qs || "");
    const s = p.split("/").filter(Boolean);
    if (s[0] === "elections" && s[1]) return { name: s[2] || "election", id: s[1], q };
    return { name: { dashboard: "dashboard", elections: "elections", "votes": "votes", notifications: "notifications", profile: "profile", help: "help", announcements: "announcements", "how-voting-works": "how" }[s[0]] || "dashboard", q };
}

export const STUDENT = {
    name: "Amara Okafor", firstName: "Amara", studentId: "HU-2023-04817",
    department: "Computer Science", faculty: "Faculty of Sciences", level: "300 Level",
    email: "amara.okafor@hartwell.edu",
};

export const TITLES = {
    dashboard: "Dashboard",
    elections: "Elections",
    election: "Election details",
    confirmation: "Vote confirmation",
    results: "Election results",
    votes: "My Voting Activity",
    notifications: "Notifications",
    profile: "Profile",
    help: "Help",
    announcements: "Announcements",
    how: "How voting works",
};

const MS_PER_DAY = 86_400_000;
export const d = (y: number, m: number, day: number, h: number = 0, mi: number = 0) => new Date(y, m - 1, day, h, mi);
export const CLOCK_OFFSET = d(2026, 9, 24, 10, 30).getTime() - Date.now();
export const now = () => new Date(Date.now() + CLOCK_OFFSET);

export const initials = (name: string) => name.split(" ").map((w) => w[0]).slice(0, 2).join("");
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const fmtDate = (x: Date) => `${MONTHS[x.getMonth()]} ${x.getDate()}, ${x.getFullYear()}`;
export const fmtShort = (x: Date) => `${MONTHS[x.getMonth()]} ${x.getDate()}`;
export const fmtTime = (x: Date) => { let h = x.getHours(); const m = String(x.getMinutes()).padStart(2, "0"); const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12; return `${h}:${m} ${ap}`; };
export const fmtDateTime = (x: Date) => `${fmtDate(x)}, ${fmtTime(x)}`;
export const fmtRange = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() ? `${fmtShort(a)} – ${fmtShort(b)}, ${b.getFullYear()}` : `${fmtDate(a)} – ${fmtDate(b)}`;
export const AV = [["#dbe7ff", "#1e3a8a"], ["#dff3e6", "#14532d"], ["#fdf0d0", "#713f12"], ["#e8e3fb", "#3b2a86"], ["#fde2e2", "#7f1d1d"], ["#dcf1f4", "#0f4c5c"]];
export const avColor = (name: string) => AV[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AV.length];

export const startsIn = (x: Date): string => {
    const n = daysUntil(x);
    return n <= 0 ? "Starts today" : n === 1 ? "Starts tomorrow" : `Starts in ${n} days`;
};

export const closesIn = (x: Date): string => {
    const n = daysUntil(x);
    return n <= 0 ? "Closes today" : n === 1 ? "Closes tomorrow" : `Closes in ${n} days`;
};

export const mmss = (ms: number): string => {
    const s = Math.ceil(ms / 1000);
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export const daysUntil = (x: Date): number =>
    Math.ceil((x.getTime() - now().getTime()) / MS_PER_DAY);
