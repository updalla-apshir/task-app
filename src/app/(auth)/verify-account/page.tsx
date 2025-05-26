"use client";


import { VerifyAccount } from "@/components/auth/verify-account"
import { RootState } from "@/store/store";
import { redirect } from "next/navigation"
import { useSelector } from "react-redux";


export default function VerifyAccountPage() {

  const { email, password } = useSelector(
    (state: RootState) => state.user
  );

  if (!email) {
    redirect("/sign-up");
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <VerifyAccount email={email} />
    </div>
  );
}