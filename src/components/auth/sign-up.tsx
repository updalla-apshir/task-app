"use client";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
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
import { userRegisterSchema } from "@/schemas/shema"; // Import your Zod schema
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Label } from "../ui/label";
// import { registerUser } from "../../../actions/register";
import { toast } from "sonner";
import { sendVerificationCodeEmail } from "../../../actions/send-email";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUserData, setLoading, setError } from "@/store/features/userSlice";
import { getUserData } from "../../../actions/register";

function SignUpForm() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(userRegisterSchema), // Enable Zod validation
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onsubmit = async (data: {
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      setIsLoading(true);
      dispatch(setLoading(true));
      dispatch(setError(null));

      dispatch(
        setUserData({
          email: data.email,
          password: data.password, // Store password in Redux
        })
      );

      const result = await getUserData(data.email);

      if (result === "User already exists") {
        form.setError("email", {
          type: "manual",
          message: result,
        });
        toast.error(result, {
          position: "top-center",
        });
        return;
      }

      const res = await sendVerificationCodeEmail(data.email);

      if (res.success) {
        toast.success("Verification code sent!", {
          description: "Please check your email for the verification code.",
          duration: 3000,
          position: "top-center",
        });

        router.push("/verify-account");
      } else {
        const errMsg =
          typeof res.error === "string"
            ? res.error
            : "Failed to send verification code";

        toast.error("Failed to send verification code", {
          position: "top-center",

          description: errMsg,
        });

        dispatch(setError(errMsg));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      dispatch(setError(errorMessage));

      toast.error("Something went wrong", {
        position: "top-center",

        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  };

  const isFormValid =
    !form.formState.errors.email &&
    !form.formState.errors.password &&
    !form.formState.errors.confirmPassword &&
    form.getValues("password") === form.getValues("confirmPassword");

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onsubmit)}>
        <Card className="w-full sm:w-96 dark:bg-[#0e0c0b]">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              Create your account
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Join us today and enjoy personalized features and benefits.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Email Field */}

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

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <Label>Confirm Password</Label>
                  <FormControl>
                    <Input type="password" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.confirmPassword?.message ||
                      (form.getValues("password") !==
                        form.getValues("confirmPassword") &&
                        form.getValues("confirmPassword") &&
                        "Passwords do not match")}
                  </FormMessage>
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter>
            <div className="grid w-full gap-y-4">
              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending verification code...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>

              <Button variant="link" size="sm" disabled={isLoading}>
                <Link href="/sign-in">Already have an account? Sign in</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
      {/* Success Alert */}
    </FormProvider>
  );
}

export { SignUpForm };
