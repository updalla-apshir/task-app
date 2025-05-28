import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { Icons } from "../ui/icons";

export const GoogleLoginButton = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    } else if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  const handleLogin = () => {
    signIn("google");
  };

  return (
      <Button size="sm" variant="outline" type="button" onClick={handleLogin}>
        <Icons.google className="mr-2 w-4 h-4" />
        google
      </Button>
  );
};
