"use client";

import { useQuery } from "@tanstack/react-query";
import { getTeam } from "../../../actions/team";
import { CreateTeam } from "../../components/team/CreateTeam";
import { AddTeamMember } from "../../components/team/AddTeamMember";
import { TeamMembersTable } from "../../components/team/TeamMembersTable";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
}

interface TeamMember {
  id: string;
  role: string;
  user: User;
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  projects: any[];
}

interface EmptyTeam {
  members: TeamMember[];
}

const useTeam = () => {
  return useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      try {
        const result = await getTeam();
        console.log("Team data:", result);
        return result as Team | EmptyTeam | null;
      } catch (error) {
        console.error("Error fetching team:", error);
        throw error;
      }
    },
  });
};

const TableSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-10 w-[250px]" />
    <div className="border rounded-lg">
      <div className="border-b h-12" />
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex items-center space-x-4 p-4 border-b last:border-0"
        >
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Page = () => {
  const { data, isLoading, error, refetch } = useTeam();

  if (isLoading) return <TableSkeleton />;
  if (error) {
    console.error("Team page error:", error);
    return (
      <div className="p-4 rounded-md bg-red-50 text-red-800">
        <h3 className="font-semibold">Error loading team data</h3>
        <p className="text-sm mt-1">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred"}
        </p>
      </div>
    );
  }

  // Type guard to check if data is a full Team
  const isFullTeam = (
    data: Team | EmptyTeam | null | undefined
  ): data is Team => {
    return data !== null && data !== undefined && "id" in data;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Team</h2>
        <div className="flex gap-2">
          {isFullTeam(data) ? (
            <AddTeamMember teamId={data.id} onMemberAdd={refetch} />
          ) : (
            <CreateTeam onTeamCreate={refetch} />
          )}
        </div>
      </div>

      {isFullTeam(data) ? (
        data.members && data.members.length > 0 ? (
          <TeamMembersTable data={data.members} />
        ) : (
          <div className="text-center mt-8 text-muted-foreground">
            No team members yet. Add members to get started.
          </div>
        )
      ) : (
        <div className="text-center mt-8 text-muted-foreground">
          You haven't created a team yet. Create one to get started.
        </div>
      )}
    </div>
  );
};

export default Page;
