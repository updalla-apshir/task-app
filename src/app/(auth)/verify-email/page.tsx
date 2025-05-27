"use client";

import { VerifyPassComponent } from "@/components/auth/verify-password-rest"
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { redirect } from "next/navigation";

const VerifyEmailPage = () => {
  const email = useSelector((state: RootState) => state.resetPassword.email);

  if (!email) {
    redirect('/forget-password');
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <VerifyPassComponent email={email} />
    </div>
  )
}

export default VerifyEmailPage;