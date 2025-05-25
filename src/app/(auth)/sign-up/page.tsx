
import { SignUpForm } from "@/components/auth/sign-up"

export const metadata = {
  title: "Sign Up",
  description: "Sign up to create your account and enjoy personalized features.",
}

const SignUpPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUpForm />
    </div>
  )
}

export default SignUpPage


