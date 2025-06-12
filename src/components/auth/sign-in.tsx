"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm, FormProvider } from "react-hook-form"; // Import FormProvider
import { zodResolver } from "@hookform/resolvers/zod";
import { userLoginSchema } from "@/schemas/shema"; // Import your Zod schema
import { FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { sendVerificationCodeEmail } from "../../../actions/send-email";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Icons } from "../ui/icons";
import { userdata } from "../../../actions/sign-in";
import { signIn } from "next-auth/react";
import TwoFactorAuthPage from "@/app/(auth)/2fa-auth/page";
import { useDispatch } from "react-redux";
import { setUserData, setLoading, setError } from "@/store/features/userSlice";
import bcrypt from "bcryptjs";
import { GoogleLoginButton } from "./google-login-button";
import { GithubLoginButton } from "./github-login-button";

function SignInForm() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ... existing code ...
  const onsubmit = async (data: { email: string; password: string }) => {
    try {
      setIsLoading(true);

      // Fetch user data
      const res = await userdata(data.email);
      if (!res?.email || !res?.password) {
        throw new Error("Invalid email or password");
      }

      // Handle 2FA
      if (res?.password) {
        // Validate password first
        const isPasswordValid = await bcrypt.compare(
          data.password,
          res.password
        );
        if (!isPasswordValid) {
          toast.error("Invalid email or password", { position: "top-center" });
          return;
        }

        // Send verification code and proceed with 2FA
        await sendVerificationCodeEmail(res.email);
        toast.success("Verification code sent to your email", {
          position: "top-center",
        });

        // Store user info for later 2FA use
        dispatch(setUserData({ email: data.email, password: data.password }));
        router.push("/2fa-auth");
        return;
      }

      // Try signing in
      const response = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (response?.ok && response.url) {
        toast.success("Successfully logged in!", {
          position: "top-center",
        });

        router.push("/");
      } else {
        toast.error("Invalid email or password", { position: "top-center" });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      toast.error("Authentication failed", {
        position: "top-center",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    !form.formState.errors.email && !form.formState.errors.password;

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onsubmit)}>
        <Card className="w-full sm:w-96 dark:bg-[#0e0c0b]">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              Sign in to your account
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Welcome back Please enter your credentials to continue.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-x-4">
                <GithubLoginButton />
                <GoogleLoginButton />
              </div>
              <p className="flex items-center gap-x-3 text-sm text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                or
              </p>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label>Email Address</Label>
                    <FormControl>
                      <Input type="email" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.email?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label>Password</Label>
                    <FormControl>
                      <Input type="password" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.password?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </div>
            <p className="text-right text-sm ">
              <Link
                href="/forget-password"
                className="text-gray-800 hover:text-gray-400 underline dark:text-white"
              >
                Forgot your password?
              </Link>
            </p>
          </CardContent>

          <CardFooter>
            <div className="grid w-full gap-y-2">
              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>

              <Button variant="link" size="sm" disabled={isLoading}>
                <Link href="/sign-up">Don't have account? Sign Up</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  );
}

export { SignInForm };
