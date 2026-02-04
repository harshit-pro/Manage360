import { signUp } from "@/lib/auth";
import { renew, setActiveUntil } from "@/lib/membership";
import { ensureMeta } from "@/lib/students";

const SESSION_KEY = "cl.session";

const demos = [
    { name: "Aman Verma", email: "aman@example.com" },
    { name: "Priya Sharma", email: "priya@example.com" },
    { name: "Rohit Singh", email: "rohit@example.com" },
    { name: "Neha Patel", email: "neha@example.com" },
    { name: "Arjun Mehta", email: "arjun@example.com" },
    { name: "Kavya Iyer", email: "kavya@example.com" },
    { name: "Vikas Gupta", email: "vikas@example.com" },
    { name: "Sonal Agarwal", email: "sonal@example.com" },
    { name: "Deepak Rao", email: "deepak@example.com" },
    { name: "Ishita Bose", email: "ishita@example.com" },
    { name: "Karan Kapoor", email: "karan@example.com" },
    { name: "Riya Jain", email: "riya@example.com" },
];

export function seedDemoData() {
    // Don't override if already seeded with 6+ users
    const users = JSON.parse(localStorage.getItem("cl.users") || "[]");
    if (users.length >= 6) return;
    const previousSession = localStorage.getItem(SESSION_KEY);

    try {
        demos.forEach((d, i) => {
            try {
                const user = signUp(d.name, d.email, "12345678");
                // attach metadata
                const meta = ensureMeta(user.id, i);
                // Customize some details
                meta.guardianName = ["Raj", "Pooja", "Ramesh", "Sita"][i % 4];
                meta.isEnrolled = i % 6 !== 1; // some have left
                meta.seasonalFees = 500 + (i % 3) * 100;
                meta.feesDeposited = meta.seasonalFees;
                const allMeta = JSON.parse(localStorage.getItem("cl.studentMeta") || "{}");
                allMeta[user.id] = meta;
                localStorage.setItem("cl.studentMeta", JSON.stringify(allMeta));
                // Stagger membership states: some expire soon, some expired, some long active
                if (meta.isEnrolled === false) {
                    // mark as expired long ago
                    const dt = new Date();
                    dt.setDate(dt.getDate() - 30);
                    setActiveUntil(user.id, dt.toISOString());
                } else if (i % 4 === 0) {
                    // expires in 1 day
                    const dt = new Date();
                    dt.setDate(dt.getDate() + 1);
                    setActiveUntil(user.id, dt.toISOString());
                } else if (i % 4 === 1) {
                    // expired yesterday
                    const dt = new Date();
                    dt.setDate(dt.getDate() - 1);
                    setActiveUntil(user.id, dt.toISOString());
                } else if (i % 4 === 2) {
                    // active 15 days
                    const dt = new Date();
                    dt.setDate(dt.getDate() + 15);
                    setActiveUntil(user.id, dt.toISOString());
                } else {
                    // renew for 1 month default amount 500
                    renew(user.id, 1, 500, "cash", "seed");
                }
            } catch {
                // ignore signup failures due to duplicates
            }
        });
    } finally {
        // restore session
        if (previousSession) localStorage.setItem(SESSION_KEY, previousSession);
        else localStorage.removeItem(SESSION_KEY);
    }
}
