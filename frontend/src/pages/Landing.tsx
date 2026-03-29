import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, GraduationCap, Users, Wallet, ArrowRight, LayoutDashboard, ShieldCheck, Zap } from "lucide-react";
const features = [
    {
        icon: GraduationCap,
        title: "Smart Library Management",
        desc: "Track memberships, seats, and study schedules in one beautiful dashboard.",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    {
        icon: Users,
        title: "Student CRM",
        desc: "Maintain student profiles, renewals, and communication with ease.",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
    },
    {
        icon: Wallet,
        title: "Fee & Renewal Flow",
        desc: "Record payments, send reminders, and keep revenue on track.",
        color: "text-green-500",
        bg: "bg-green-500/10",
    },
    {
        icon: LayoutDashboard,
        title: "Visual Seat Booking",
        desc: "Interactive seat map for students to choose their preferred spot.",
        color: "text-orange-500",
        bg: "bg-orange-500/10",
    },
    {
        icon: ShieldCheck,
        title: "Secure Access",
        desc: "Role-based access control for staff and administrators.",
        color: "text-red-500",
        bg: "bg-red-500/10",
    },
    {
        icon: Zap,
        title: "Instant Reports",
        desc: "Real-time analytics on occupancy, revenue, and churn rates.",
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
    },
];

export default function Landing() {
    return (
        <div className="min-h-screen bg-background selection:bg-primary/15 safe-pb">
            <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 safe-pt">
                <div className="container mx-auto flex h-14 items-center justify-between gap-3 px-4 md:h-16">
                    <Link to="/" className="flex min-w-0 items-center gap-2 font-bold tracking-tight">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm text-primary-foreground shadow-md">
                            M
                        </div>
                        <span className="truncate text-lg md:text-xl">Manage360</span>
                    </Link>
                    <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
                        <a href="#features" className="transition-colors hover:text-foreground">Features</a>
                        <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
                    </nav>
                    <div className="flex shrink-0 items-center gap-2">
                        <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                            <Link to="/login">Log in</Link>
                        </Button>
                        <Button asChild size="sm" className="rounded-full px-4 shadow-md md:px-6">
                            <Link to="/signup">Get started</Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden pb-20 pt-10 md:pb-32 md:pt-20">
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border)/0.5)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.5)_1px,transparent_1px)] bg-[size:20px_28px]" />
                <div className="absolute left-1/2 top-0 -z-10 h-[280px] w-[min(100%,480px)] -translate-x-1/2 rounded-full bg-primary/15 blur-[90px]" />

                <div className="container mx-auto px-4 text-center">
                    <Badge variant="outline" className="mb-5 rounded-full border-primary/25 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary md:mb-6 md:px-4 md:text-sm">
                        Built for study centers & libraries
                    </Badge>

                    <h1 className="mx-auto max-w-4xl text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                        Run your library from{" "}
                        <span className="text-primary">phone or desk</span>
                    </h1>

                    <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground md:mt-6 md:text-lg">
                        Streamline enrollments, automate fee reminders, and optimize seat allocation.
                        The all-in-one platform designed for modern study centers.
                    </p>

                    <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:mx-auto sm:max-w-none sm:flex-row sm:justify-center md:mt-10">
                        <Button asChild size="lg" className="h-12 w-full rounded-full text-base shadow-md sm:w-auto sm:min-w-[200px]">
                            <Link to="/signup">
                                Start free <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="h-12 w-full rounded-full border-primary/25 bg-background/80 text-base backdrop-blur-sm sm:w-auto sm:min-w-[200px]">
                            <Link to="/login">Sign in</Link>
                        </Button>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground md:mt-10 md:text-sm">
                        <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                            <span>Enrollment & renewals</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                            <span>Mobile-friendly workspace</span>
                        </div>
                    </div>

                    {/* Dashboard Preview */}
                    <div className="relative mx-auto mt-20 max-w-5xl rounded-xl border bg-background/50 p-2 shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 lg:rounded-2xl lg:p-4">
                        <div className="absolute -top-12 -left-12 -z-10 h-72 w-72 rounded-full bg-purple-500/20 blur-[80px]"></div>
                        <div className="absolute -bottom-12 -right-12 -z-10 h-72 w-72 rounded-full bg-blue-500/20 blur-[80px]"></div>

                        <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
                            <img
                                src="/hero-dashboard.png"
                                alt="Dashboard Interface"
                                className="w-full object-cover"
                                onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.parentElement!.innerHTML = `
                                        <div class="aspect-[16/9] w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center relative overflow-hidden">
                                            <div class="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                                            <div class="text-center p-8 z-10">
                                                <div class="mx-auto h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 shadow-inner">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
                                                </div>
                                                <h3 class="text-2xl font-bold text-foreground">Dashboard Preview</h3>
                                                <p class="text-muted-foreground mt-2">Interactive dashboard visualization</p>
                                            </div>
                                            
                                            <!-- Decorative UI Elements -->
                                            <div class="absolute top-4 left-4 right-4 h-12 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 opacity-60"></div>
                                            <div class="absolute top-20 left-4 w-64 bottom-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 opacity-60"></div>
                                            <div class="absolute top-20 left-72 right-4 h-32 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 opacity-60"></div>
                                            <div class="absolute top-56 left-72 right-4 bottom-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 opacity-60"></div>
                                        </div>
                                    `;
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="border-y bg-muted/30 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-bold text-foreground">500+</h3>
                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Libraries</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-bold text-foreground">50k+</h3>
                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Students</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-bold text-foreground">99.9%</h3>
                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Uptime</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-bold text-foreground">24/7</h3>
                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Support</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="container mx-auto px-4 py-24">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        Everything you need to run a <br />
                        <span className="text-primary">World-Class Library</span>
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                        Powerful features designed to automate your workflow and improve student experience.
                    </p>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((f, i) => (
                        <Card key={f.title} className="group relative overflow-hidden border-muted transition-all hover:shadow-xl hover:-translate-y-1">
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${f.bg.replace('/10', '/20')}`} />
                            <CardContent className="p-8">
                                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl ${f.bg} ${f.color}`}>
                                    <f.icon className="h-7 w-7" />
                                </div>
                                <h3 className="mb-3 text-xl font-bold">{f.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 pb-24">
                <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-20 text-center shadow-2xl sm:px-12 sm:py-24">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-black/10 via-transparent to-transparent"></div>

                    <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                        Ready to transform your library?
                    </h2>
                    <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/80">
                        Join hundreds of libraries already using Manage360 to manage their operations.
                    </p>
                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button asChild size="lg" variant="secondary" className="h-12 min-w-[180px] rounded-full text-base font-semibold shadow-lg transition-transform hover:scale-105">
                            <Link to="/signup">Get Started Now</Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="h-12 min-w-[180px] rounded-full border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 text-base">
                            <Link to="/login">Contact Sales</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t bg-muted/20">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid gap-8 md:grid-cols-4 lg:grid-cols-5">
                        <div className="col-span-2">
                            <Link to="/" className="mb-4 flex items-center gap-2 text-xl font-bold">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                                    M
                                </div>
                                <span>Manage360</span>
                            </Link>
                            <p className="max-w-xs text-sm text-muted-foreground">
                                The most advanced library management system for modern study centers and co-working spaces.
                            </p>
                        </div>
                        <div>
                            <h4 className="mb-4 font-semibold">Product</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground">Features</a></li>
                                <li><a href="#" className="hover:text-foreground">Pricing</a></li>
                                <li><a href="#" className="hover:text-foreground">Showcase</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="mb-4 font-semibold">Company</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground">About</a></li>
                                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                                <li><a href="#" className="hover:text-foreground">Careers</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="mb-4 font-semibold">Legal</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
                                <li><a href="#" className="hover:text-foreground">Terms</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Manage360. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
