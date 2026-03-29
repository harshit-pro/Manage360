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
        <div className="relative grid min-h-svh min-h-[100dvh] place-items-center overflow-hidden bg-background p-4 safe-pb safe-pt">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.12),transparent_55%),radial-gradient(ellipse_at_bottom,_hsl(var(--muted)),transparent_45%)]" />

            <Card className="relative z-10 w-full max-w-md border-border/80 bg-card/95 shadow-xl backdrop-blur-md animate-in fade-in zoom-in duration-300">
                <CardHeader className="space-y-1 pb-2 text-center">
                    <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                        <LogIn className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight md:text-3xl">
                        Welcome back
                    </CardTitle>
                    <CardDescription className="text-base">
                        Sign in to your library workspace
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
                                    className="pl-9"
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
                                    className="pl-9"
                                    placeholder="••••••••"
                                    {...register("password", { required: "Password is required" })}
                                />
                            </div>
                            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
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
