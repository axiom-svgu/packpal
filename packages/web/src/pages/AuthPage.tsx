import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, signUpSchema } from "@/schemas/authSchemas";
import type { SignInFormValues, SignUpFormValues } from "@/schemas/authSchemas";
import { useState, useEffect } from "react";
import { authService } from "@/services/AuthService";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store";
import { Package } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AuthPage() {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Admin Login Credentials",
      description: "Email: admin@example.com, Password: password123",
      duration: 6000,
    });
  }, [toast]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-center">PackPal</h1>
          <p className="text-muted-foreground text-center mt-2">
            The smart way to organize your group trips
          </p>
        </div>

        <Card className="border shadow-lg">
          <CardContent className="pt-6 px-6 pb-8">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold">Welcome</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Sign in to your account or create a new one
              </p>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin" className="mt-0">
                <SignInForm />
              </TabsContent>
              <TabsContent value="signup" className="mt-0">
                <SignUpForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SignInForm({ className, ...props }: React.ComponentProps<"form">) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.signIn(data);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        useAuthStore
          .getState()
          .login(response.data.data.user, response.data.data.token);
        navigate("/");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className={cn("space-y-4", className)}
      {...props}
      onSubmit={handleSubmit(onSubmit)}
    >
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full mt-2" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}

function SignUpForm({ className, ...props }: React.ComponentProps<"form">) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: "admin",
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.signUp(data);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        useAuthStore
          .getState()
          .login(response.data.data.user, response.data.data.token);
        navigate("/");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className={cn("space-y-4", className)}
      {...props}
      onSubmit={handleSubmit(onSubmit)}
    >
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full mt-2" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
