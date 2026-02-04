import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { signup } from "@/lib/auth";
import { Loader2, Library, Users, MapPin, Building2, Mail, Lock, ArrowRight } from "lucide-react";

export default function Signup() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        libraryName: "",
        address: "",
        city: "",
        totalSeats: "",
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.id]: e.target.value });
        if (errors[e.target.id]) {
            setErrors(prev => ({ ...prev, [e.target.id]: "" }));
        }
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!form.libraryName) newErrors.libraryName = "Library name is required";
        if (!form.totalSeats) newErrors.totalSeats = "Total seats required";
        if (!form.email) newErrors.email = "Email is required";
        if (!form.password) newErrors.password = "Password is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            await signup({
                libraryName: form.libraryName,
                address: form.address || undefined,
                city: form.city || undefined,
                totalSeats: Number(form.totalSeats),
                email: form.email,
                password: form.password,
            });
            toast({ title: "Library created! Redirecting..." });
            navigate("/dashboard", { replace: true });
        } catch (e: any) {
            const status = e?.response?.status;
            if (status === 400) {
                toast({ title: "Validation error", description: e.response?.data?.message || "Please check your input.", variant: "destructive" });
            } else if (status === 409) {
                toast({ title: "Email already registered", description: "Please use a different email.", variant: "destructive" });
            } else {
                toast({ title: "Signup failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen grid place-items-center p-4 bg-gray-50 dark:bg-gray-900 relative overflow-hidden transition-colors duration-300">
            {/* Background Animations */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob dark:bg-purple-900 dark:mix-blend-screen"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 dark:bg-indigo-900 dark:mix-blend-screen"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 dark:bg-pink-900 dark:mix-blend-screen"></div>

            <Card className="w-full max-w-2xl relative z-10 backdrop-blur-xl bg-white/60 dark:bg-black/40 border-white/20 shadow-2xl animate-in fade-in zoom-in duration-500">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <Library className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                        Create Your Library
                    </CardTitle>
                    <CardDescription>
                        Set up your digital library management system in seconds
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="libraryName">Library Name *</Label>
                                <div className="relative">
                                    <Library className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input id="libraryName" className="pl-9 bg-white/50 dark:bg-black/20" placeholder="Central Library" value={form.libraryName} onChange={handleChange} />
                                </div>
                                {errors.libraryName && <p className="text-sm text-destructive">{errors.libraryName}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="totalSeats">Total Seats *</Label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input id="totalSeats" type="number" min="1" className="pl-9 bg-white/50 dark:bg-black/20" placeholder="100" value={form.totalSeats} onChange={handleChange} />
                                </div>
                                {errors.totalSeats && <p className="text-sm text-destructive">{errors.totalSeats}</p>}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input id="address" className="pl-9 bg-white/50 dark:bg-black/20" placeholder="123 Main St" value={form.address} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input id="city" className="pl-9 bg-white/50 dark:bg-black/20" placeholder="New York" value={form.city} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-muted/50" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background/0 px-2 text-muted-foreground font-medium backdrop-blur-sm">
                                    Owner Account
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="email">Owner Email *</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input id="email" type="email" className="pl-9 bg-white/50 dark:bg-black/20" placeholder="admin@library.com" value={form.email} onChange={handleChange} />
                                </div>
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password *</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input id="password" type="password" className="pl-9 bg-white/50 dark:bg-black/20" placeholder="••••••••" value={form.password} onChange={handleChange} />
                                </div>
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300 transform hover:scale-[1.01]" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Library...
                                </>
                            ) : (
                                <>
                                    Create Library & Continue
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <div className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary hover:underline font-medium">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
