import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login, currentUser } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Mail, Lock, ArrowRight, LogIn } from "lucide-react";

type FormData = { email: string; password: string };

export default function Login() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
    const nav = useNavigate();
    const { state } = useLocation() as { state?: { from?: Location } };
    const { toast } = useToast();

    const onSubmit = async (data: FormData) => {
        try {
            const { token, role } = await login(data.email, data.password);
            const user = currentUser();
            toast({ title: `Welcome back, ${user?.name?.split(" ")[0] ?? "User"}!` });
            nav((state?.from as any)?.pathname || "/dashboard", { replace: true });
        } catch (e: any) {
            const message = e?.response?.data?.message || e.message || "Something went wrong";
            toast({ title: "Login failed", description: message, variant: "destructive" });
        }
    };

    return (
        <div className="min-h-screen grid place-items-center p-4 bg-gray-50 dark:bg-gray-900 relative overflow-hidden transition-colors duration-300">
            {/* Background Animations */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob dark:bg-purple-900 dark:mix-blend-screen"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 dark:bg-indigo-900 dark:mix-blend-screen"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 dark:bg-pink-900 dark:mix-blend-screen"></div>

            <Card className="w-full max-w-md relative z-10 backdrop-blur-xl bg-white/60 dark:bg-black/40 border-white/20 shadow-2xl animate-in fade-in zoom-in duration-500">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <LogIn className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                        Welcome Back
                    </CardTitle>
                    <CardDescription>
                        Sign in to access your library dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    className="pl-9 bg-white/50 dark:bg-black/20"
                                    placeholder="admin@library.com"
                                    {...register("email", { required: "Email is required" })}
                                />
                            </div>
                            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    className="pl-9 bg-white/50 dark:bg-black/20"
                                    placeholder="••••••••"
                                    {...register("password", { required: "Password is required" })}
                                />
                            </div>
                            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                        </div>
                        <Button type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300 transform hover:scale-[1.01]" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center flex-col gap-4">
                    <div className="text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-primary hover:underline font-medium">
                            Create Library
                        </Link>
                    </div>
                    {/* Optional: Add a "Forgot Password" link if needed later */}
                </CardFooter>
            </Card>
        </div>
    );
}
