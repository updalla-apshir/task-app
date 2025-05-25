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
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";

function SignInForm() {
  return (
    <div className="grid w-full grow items-center px-4 sm:justify-center">
      <Card className="w-full sm:w-96">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Welcome back! Please enter your credentials to continue.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-y-4">
            <div className="grid grid-cols-2 gap-x-4">
              <Button size="sm" variant="outline" type="button">
                <Icons.gitHub className="mr-2 size-4" />
                GitHub
              </Button>
              <Button size="sm" variant="outline" type="button">
                <Icons.google className="mr-2 size-4" />
                Google
              </Button>
            </div>

            <p className="flex items-center gap-x-3 text-sm text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
              or
            </p>

            <div className="">
              <Label>Email address</Label>
              <Input type="email" required />
            </div>

            <div className="">
              <Label>Password</Label>
              <Input type="password" required />
            </div>
            {/* Forgot Password Link */}
          </div>
          <p className="text-right text-sm">
            <Link
              href="/forget-password"
              className="text-gray-800 hover:text-gray-400 underline"
            >
              Forgot your password?
            </Link>
          </p>
        </CardContent>

        <CardFooter>
          <div className="grid w-full gap-y-4">
            <Button>Continue</Button>
            <Button variant="link" size="sm" asChild>
              <Link href="/sign-up">Don't have account? Sign Up</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export { SignInForm };
