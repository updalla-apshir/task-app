"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { userdata } from "../../../actions/sign-in";
import { sendVerificationCodeEmail } from "../../../actions/send-email";
import { useDispatch } from "react-redux";
import { initiateReset } from "@/store/features/resetPasswordSlice";
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export default function ForgetPassword() {
  const form = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });
  const router = useRouter();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);

  const onsubmit = async (data: { email: string }) => {
    setIsLoading(true);
    try {
      const response = await userdata(data.email);
      if (!response?.email) {
        toast.error("Invalid email Address!", {
          position: "top-center",
        });
        setIsLoading(false);
        return;
      }

      await sendVerificationCodeEmail(data.email);
      toast.success("Password reset link sent to your email!", {
        position: "top-center",
      });
      dispatch(initiateReset(data.email)); // This stores the email in Redux

      router.push("/verify-email");
    } catch (error) {
      toast.error("Failed to send reset link. Please try again.", {
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-[400px] dark:bg-[#0e0c0b]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Reset password</CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onsubmit)} className="space-y-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Email Address</Label>
                      <FormControl>
                        <Input {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors.email?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Sending reset link..." : "Send reset link"}
              </Button>
            </form>
          </FormProvider>

          <div className="mt-4 text-center text-sm">
            <Link
              href="/login"
              className="text-primary hover:text-primary/90 underline-offset-4 hover:underline"
            >
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
