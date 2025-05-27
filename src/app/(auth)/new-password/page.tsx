"use client";


import NewPassword from "@/components/auth/new-password";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";
import { redirect } from "next/navigation";

const NewPasswordPage = () => {
  const email = useSelector((state: RootState) => state.resetPassword.email);

  if (!email) {
    redirect("/forget-password");
  }

  return (
    <div className="">
      <NewPassword email={email} />
    </div>
  );
};

export default NewPasswordPage;
