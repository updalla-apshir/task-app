"use client";
import Link from "next/link";
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
import { registerUser } from "../../../actions/register";
import { useState } from "react";
import { CircleArrowRight, CircleCheck, Info } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
function SignUpForm() {
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
      const res = await registerUser(data);
      if (res.success) {
        console.log("User registered successfully");
        form.reset();
        toast.success("Your action was created successfully!");
      } else if (res.errors) {
        Object.entries(res.errors).forEach(([field, messages]) => {
          form.setError(field as any, {
            type: "manual",
            message: messages?.[0] || "Invalid input",
          });
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Something went wrong", {
        className: "bg-red-600 text-white",
      });
    }
  };
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
                    <Input type="email" {...field} />
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
                    <Input type="password" {...field} />
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
                    <Input type="password" {...field} />
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
                disabled={
                  !!form.formState.errors.email ||
                  !!form.formState.errors.password ||
                  !!form.formState.errors.confirmPassword ||
                  (form.getValues("password") !== form.getValues("confirmPassword"))
                }
                className="disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Continue
              </Button>
              <Button variant="link" size="sm">
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
