import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, signUpSchema } from "@/schemas/authSchemas";
import type { SignInFormValues, SignUpFormValues } from "@/schemas/authSchemas";
import { useState } from "react";
import { authService } from "@/services/AuthService";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store";

export default function AuthPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background to-muted flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12">
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row rounded-xl overflow-hidden shadow-2xl">
        {/* Form Section */}
        <Card className="w-full lg:w-1/2 border-0 bg-card shadow-none">
          <CardContent className="flex flex-col justify-center p-4 sm:p-6 md:p-8 lg:p-12 space-y-6">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome Back
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign in to your account or create a new one
              </p>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <div className="h-[360px] transition-all duration-300 ease-in-out mt-6">
                <TabsContent value="signin" className="m-0 h-full">
                  <SignInForm />
                </TabsContent>
                <TabsContent value="signup" className="m-0 h-full">
                  <SignUpForm />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Brand/Image Section */}
        <div className="hidden lg:block w-1/2 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/90 backdrop-blur-sm flex flex-col items-center justify-center p-12 text-primary-foreground">
            <div className="w-24 h-24 rounded-full bg-primary-foreground/20 flex items-center justify-center mb-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-foreground"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-center">
              Secure Your Data
            </h2>
            <p className="text-center max-w-md opacity-90">
              Log in to access your personal dashboard and manage your
              information with confidence.
            </p>
          </div>
        </div>
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
      className={cn("flex flex-col gap-6 min-h-[320px]", className)}
      {...props}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid gap-5">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
            {error}
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            className="h-10"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
          </div>
          <Input
            id="password"
            type="password"
            className="h-10"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full h-10 mt-2" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </div>
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
  });

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const { confirmPassword, ...userData } = data;
      const response = await authService.signUp(userData);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        // Update auth store
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
      className={cn("flex flex-col gap-6 min-h-[320px]", className)}
      {...props}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid gap-5">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
            {error}
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            className="h-10"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            className="h-10"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            className="h-10"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirm-password" className="text-sm font-medium">
            Confirm Password
          </Label>
          <Input
            id="confirm-password"
            type="password"
            className="h-10"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full h-10 mt-2" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>
      </div>
    </form>
  );
}
