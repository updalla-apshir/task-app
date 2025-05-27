"use client";

import { Twofauth } from "@/components/auth/2fa-auth";
import { RootState } from "@/store/store";

import { useSelector } from "react-redux";


export default function TwoFactorAuthPage() {
    const { email, password } = useSelector((state: RootState) => state.user);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Twofauth email={email} password={password} />
    </div>
  );
} 