"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Role } from "@/types/user";
import { AssigneeSelect } from "./AssigneeSelect";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { getTeamMembers, type TeamMember } from "@/actions/team";

interface AssigneeSelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function AssigneeSelectField({
  value,
  onChange,
  disabled = false,
}: AssigneeSelectFieldProps) {
  const { data: session, status } = useSession();
  const userRole = session?.user?.role ?? Role.User;
  const currentUserId = session?.user?.id ?? "";

  // Only fetch team members for premium users
  const { data: teamMembers, error, isLoading } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: getTeamMembers,
    enabled: userRole === Role.Premium, // Only fetch for premium users
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2,
  });

  // Handle loading state
  if (status === "loading" || (userRole === Role.Premium && isLoading)) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error 
            ? error.message 
            : "Failed to load team members. Please try again later."}
        </AlertDescription>
      </Alert>
    );
  }

  // For non-premium users or when team members are loaded
  return (
    <AssigneeSelect
      value={value}
      onChange={onChange}
      teamMembers={teamMembers ?? []}
      currentUserId={currentUserId}
      onRedirectToTeam={() => window.location.href = "/team"}
      disabled={disabled}
    />
  );
} 