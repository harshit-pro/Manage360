import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, GraduationCap, Users, Wallet, ArrowRight, LayoutDashboard, ShieldCheck, Zap } from "lucide-react";
import { getLibraryName } from "@/lib/auth";

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
        <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600 text-primary-foreground shadow-sm">
                            M
                        </div>
                        <span>manage360</span>
                        {(() => {
                            const lib = getLibraryName();
                            return lib ? (
                                <Badge variant="secondary" className="ml-2 text-sm">
                                    {lib}
                                </Badge>
                            ) : null;
                        })()}
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <a href="#features" className="hover:text-foreground transition-colors">Features</a>
                        <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
                        <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
                    </nav>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                            Log in
                        </Link>
                        <Button asChild size="sm" className="rounded-full px-6 shadow-md hover:shadow-lg transition-all">
                            <Link to="/signup">Get Started</Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
                {/* Background Elements */}
                <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
                <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] bg-blue-500/10 opacity-30 blur-[100px]"></div>

                <div className="container mx-auto px-4 text-center">
                    <Badge variant="outline" className="mb-6 rounded-full border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary animate-in fade-in slide-in-from-bottom-4 duration-500">
                        ✨ The Modern OS for Libraries
                    </Badge>

                    <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-100">
                        Manage your library with <br className="hidden md:block" />
                        <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Unmatched Intelligence
                        </span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-200">
                        Streamline enrollments, automate fee reminders, and optimize seat allocation.
                        The all-in-one platform designed for modern study centers.
                    </p>

                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-300">
                        <Button asChild size="lg" className="h-12 min-w-[180px] rounded-full text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                            <Link to="/signup">
                                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="h-12 min-w-[180px] rounded-full border-primary/20 bg-background/50 backdrop-blur-sm hover:bg-accent/50 text-base">
                            <Link to="/login">View Demo</Link>
                        </Button>
                    </div>

                    <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground animate-in fade-in duration-1000 delay-500">
                        <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>14-day free trial</span>
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
                        Join hundreds of libraries already using Chanakya Library to manage their operations.
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
                            <Link to="/" className="mb-4 flex items-center gap-2 font-bold text-xl">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    CL
                                </div>
                                <span>Chanakya Library</span>
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
                        © {new Date().getFullYear()} Chanakya Library. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
