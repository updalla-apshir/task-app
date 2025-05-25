// pages/signup.js

import { SignInForm } from "@/components/auth/sign-in"

export const metadata = {
  title: "Sign In",
  description: "Sign in to your account and access your personalized dashboard.",
} 


const SignInPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignInForm />
    </div>
  )
}

export default SignInPage


