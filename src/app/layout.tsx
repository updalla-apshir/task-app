"use client";

import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { AuthProvider } from "@/providers/auth-provider";
import { ReduxProvider } from "@/providers/redux-provider"; // adjust the path
import { usePathname } from "next/navigation";
import { TaskProvider } from "@/contexts/TaskContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { useSession } from "next-auth/react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const noLayoutRoutes = [
    "/sign-in",
    "/sign-up",
    "/forget-password",
    "/verify-email",
    "/2fa-auth",
    "/new-password",
    "/verify-account",
  ];

  const shouldUseLayout = !noLayoutRoutes.includes(pathname);
  const queryClient = new QueryClient();
  // const { data } = useSession();
  // const role = data?.user.role;

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <QueryClientProvider client={queryClient}>
          <ReduxProvider>
            <AuthProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
                storageKey="task-app-theme"
              >
                <TaskProvider initialTasks={[]}>
                  {shouldUseLayout ? (
                    <LayoutWrapper>{children}</LayoutWrapper>
                  ) : (
                    children
                  )}
                </TaskProvider>
                <Toaster richColors />
              </ThemeProvider>
            </AuthProvider>
          </ReduxProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
