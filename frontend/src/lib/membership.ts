export type Membership = {
    userId: string;
    activeUntil: string; // ISO date
    lastPayment?: {
        date: string;
        amount: number;
        months: number;
        method: "cash" | "upi" | "card";
        note?: string;
    };
};

const MEMBERS_KEY = "cl.memberships";

function load(): Membership[] {
    const raw = localStorage.getItem(MEMBERS_KEY);
    return raw ? (JSON.parse(raw) as Membership[]) : [];
}

function save(m: Membership[]) {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(m));
}

export function getMembership(userId: string): Membership | undefined {
    return load().find((m) => m.userId === userId);
}

export function ensureMembership(userId: string): Membership {
    const all = load();
    let m = all.find((x) => x.userId === userId);
    if (!m) {
        m = { userId, activeUntil: new Date().toISOString() };
        all.push(m);
        save(all);
    }
    return m;
}

export function renew(userId: string, months: number, amount: number, method: Membership["lastPayment"]["method"], note?: string, dateOfJoining?: string): Membership {
    const all = load();
    let m = all.find((x) => x.userId === userId);
    const now = new Date();
    const currentActiveUntil = m ? new Date(m.activeUntil) : now;
    const isExpired = currentActiveUntil <= now;

    let newActive: Date;

    if (isExpired && dateOfJoining) {
        // When expired, calculate from dateOfJoining to maintain a consistent monthly cycle.
        // Advance from the joining date by 1-month increments until we pass "now",
        // then add the requested renewal months.
        const joining = new Date(dateOfJoining);
        const cycle = new Date(joining);
        while (cycle <= now) {
            cycle.setMonth(cycle.getMonth() + 1);
        }
        // cycle is the next cycle-aligned date after today
        newActive = new Date(cycle);
        newActive.setMonth(newActive.getMonth() + (months - 1));
    } else {
        // Still active → extend from current activeUntil
        const base = currentActiveUntil > now ? currentActiveUntil : now;
        newActive = new Date(base);
        newActive.setMonth(newActive.getMonth() + months);
    }
    const updated: Membership = {
        userId,
        activeUntil: newActive.toISOString(),
        lastPayment: {
            date: new Date().toISOString(),
            amount,
            months,
            method,
            note,
        },
    };
    if (m) {
        const idx = all.findIndex((x) => x.userId === userId);
        all[idx] = updated;
    } else {
        all.push(updated);
    }
    save(all);
    return updated;
}

export function setActiveUntil(userId: string, isoDate: string): Membership {
    const all = load();
    const existing = all.find((x) => x.userId === userId);
    const updated: Membership = existing
        ? { ...existing, activeUntil: isoDate }
        : { userId, activeUntil: isoDate };
    const idx = all.findIndex((x) => x.userId === userId);
    if (idx >= 0) all[idx] = updated; else all.push(updated);
    save(all);
    return updated;
}

export function expireNow(userId: string): Membership {
    const nowPast = new Date(Date.now() - 1000).toISOString();
    return setActiveUntil(userId, nowPast);
}
