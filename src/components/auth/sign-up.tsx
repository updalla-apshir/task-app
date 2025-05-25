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

function SignUpForm() {
  return (
    <div className="grid w-full grow items-center px-4 sm:justify-center">
      <Card className="w-full sm:w-96 dark:bg-[#0e0c0b]">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Create your account
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Join us today and enjoy personalized features and benefits.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-y-4">
            <div className="">
              <Label>Email address</Label>
              <Input type="email" required />
            </div>

            <div className="">
              <Label>Password</Label>
              <Input type="password" required />
            </div>

            <div className="">
              <Label>Confirm Password</Label>
              <Input type="password" required />
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <div className="grid w-full gap-y-4">
            <Button>Continue</Button>
            <Button variant="link" size="sm">
              <Link href="/sign-in">Already have an account? Sign in</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export { SignUpForm };
