"use client";

import { cn } from "@/lib/utils";
import { OTPInput, SlotProps } from "input-otp";
import { useId, useState, useEffect } from "react";
import {
  verifyCode,
  sendVerificationCodeEmail,
} from "../../../actions/send-email";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { setUserData, setLoading, setError } from "@/store/features/userSlice";
import { registerUser } from "../../../actions/register";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { setAuthenticated } from "@/store/features/userSlice";
import { setVerificationStatus } from "@/store/features/userSlice";
import { signIn } from "next-auth/react";

interface VerifyAccountProps {
  email: string;
}

export function VerifyAccount({ email }: VerifyAccountProps) {
  const id = useId();
  const router = useRouter();
  const [otp, setOtp] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const { email: userEmail, password } = useSelector(
    (state: RootState) => state.user
  );
  const dispatch = useDispatch();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timeLeft]);

  const handleResend = async () => {
    try {
      setIsResending(true);
      const res = await sendVerificationCodeEmail(email);

      if (res.success) {
        const nextAttempt = resendAttempts + 1;
        const newCooldown = (nextAttempt + 1) * 60; // 1min, 2min, 3min, etc.

        setResendAttempts(nextAttempt);
        setCooldownTime(newCooldown);
        setTimeLeft(newCooldown);

        toast.success("New code sent!", {
          position: "top-center",
          description: "Please check your email for the new verification code.",
        });
        setOtp("");
      } else {
        toast.error("Failed to send new code", {
          position: "top-center",
          description: "Please try again later.",
        });
      }
    } catch (error) {
      console.error("Resend error:", error);
      toast.error("Failed to send new code", {
        position: "top-center",
        description: "Please try again later.",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerification = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter all 6 digits", {
        position: "top-center",
      });
      return;
    }

    try {
      setIsVerifying(true);
      console.log("Verifying with email:", email);
      console.log("Current password from Redux:", password);

      const isValid = await verifyCode(email, otp);

      if (isValid === true) {
        const result = await registerUser({
          email,
          password,
          confirmPassword: password,
        });

        if (result.success) {
         
          dispatch(setUserData({ 
            email: result.user?.email || ""
          }));
          dispatch(setAuthenticated(true));
          dispatch(setVerificationStatus(true));
          
          const res = await signIn("credentials",{
            email:email,
            password:password,
            redirect:false
          })

          toast.success("Registration successful!", {
            position: "top-center",
          });

          router.push("/");
        } else {
          let errorMessage = 'Registration failed. Please try again.';
          
          if (result.errors) {
            if ('general' in result.errors && result.errors.general[0]) {
              errorMessage = result.errors.general[0];
            } else if ('email' in result.errors && result.errors.email?.[0]) {
              errorMessage = result.errors.email[0];
            }
          }
          
          toast.error(errorMessage, {
            position: "top-center",
          });
        }
      } else if (isValid === "expired") {
        toast.error("OTP has expired, please request a new one", {
          description: "Please request a new code.",
          position: "top-center",
        });
      } else {
        toast.error("Invalid OTP", {
          description: "Please check the code and try again.",
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Verification failed:", error);
      toast.error("Something went wrong", {
        description: "Try again later.",
        position: "top-center",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 w-full max-w-sm mx-auto">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold">Verify your email</h2>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code sent to {email}
        </p>
      </div>

      <div className="space-y-4">
        <OTPInput
          id={id}
          maxLength={6}
          value={otp}
          onChange={(val) => setOtp(val.replace(/\D/g, ""))}
          containerClassName="flex items-center justify-center gap-2 has-[:disabled]:opacity-50"
          disabled={isVerifying}
          render={({ slots }) => (
            <div className="flex gap-2">
              {slots.map((slot, idx) => (
                <Slot key={idx} {...slot} />
              ))}
            </div>
          )}
        />

        <div className="flex justify-between items-center">
          <Button
            variant="link"
            className="text-gray-800 hover:text-gray-400 underline dark:text-white"
            onClick={() => setOtp("")}
            disabled={isVerifying || !otp}
          >
            Clear code
          </Button>

          <Button
            variant="link"
            onClick={handleResend}
            disabled={timeLeft > 0 || isResending || isVerifying}
            className="text-gray-800 hover:text-gray-400 dark:text-white"
          >
            {isResending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : timeLeft > 0 ? (
              `Resend in ${formatTime(timeLeft)}`
            ) : (
              "Resend code"
            )}
          </Button>
        </div>

        <Button
          className="w-full"
          onClick={handleVerification}
          disabled={otp.length !== 6 || isVerifying}
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Email"
          )}
        </Button>
      </div>
    </div>
  );
}

function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        "flex size-12 items-center justify-center rounded-lg border text-lg font-semibold border-input bg-background text-foreground shadow-sm transition-all duration-200",
        {
          "z-10 ring-2 ring-offset-background ring-offset-2 ring-ring":
            props.isActive,
        }
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
    </div>
  );
}
