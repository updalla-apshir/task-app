"use client";

import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { AuthProvider } from "@/providers/auth-provider";
import { ReduxProvider } from "@/providers/redux-provider"; // adjust the path
import { usePathname } from "next/navigation";
import { TaskProvider } from "@/contexts/TaskContext";
import { Providers } from "@/components/providers";

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

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ReduxProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
              storageKey="task-app-theme"
            >
              <Providers>
                <TaskProvider>
                  {shouldUseLayout ? (
                    <LayoutWrapper>{children}</LayoutWrapper>
                  ) : (
                    children
                  )}
                </TaskProvider>
              </Providers>
              <Toaster richColors />
            </ThemeProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
