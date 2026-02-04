import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login, currentUser, setAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

type FormData = { email: string; password: string };

export default function Login() {
    const { register, handleSubmit } = useForm<FormData>();
    const nav = useNavigate();
    const { state } = useLocation() as { state?: { from?: Location } };
    const { toast } = useToast();

    const TEST_EMAIL = "test@example.com";
    const TEST_PASSWORD = "test123";
    const TEST_TOKEN = "test-token";
    const TEST_ROLE = "OWNER";

    const onSubmit = async (data: FormData) => {
        // Hard‑coded credentials for local testing
        if (data.email === TEST_EMAIL && data.password === TEST_PASSWORD) {
            // Directly set auth without calling backend
            setAuth(TEST_TOKEN, TEST_ROLE);
            const user = { name: "Test User" } as any;
            toast({ title: `Welcome back, ${user.name.split(" ")[0]}!` });
            nav((state?.from as any)?.pathname || "/dashboard", { replace: true });
            return;
        }
        try {
            const { token, role } = await login(data.email, data.password);
            const user = currentUser();
            toast({ title: `Welcome back, ${user?.name?.split(" ")[0] ?? "User"}!` });
            nav((state?.from as any)?.pathname || "/dashboard", { replace: true });
        } catch (e: any) {
            toast({ title: "Login failed", description: e.message, variant: "destructive" });
        }
    };

    return (
        <div className="min-h-screen grid place-items-center p-4">
            <Card className="w-full max-w-md">
                <CardContent className="p-6">
                    <h1 className="text-2xl font-semibold mb-2">Log in</h1>
                    <p className="text-sm text-muted-foreground mb-6">Access your Chanakya Library dashboard</p>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" required {...register("email")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required {...register("password")} />
                        </div>
                        <Button type="submit" className="w-full">Continue</Button>
                    </form>
                    <p className="mt-4 text-sm text-muted-foreground">
                        New here? <Link to="/signup" className="text-primary hover:underline">Create an account</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
