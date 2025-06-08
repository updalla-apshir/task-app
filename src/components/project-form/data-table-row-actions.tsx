"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { Task } from "@/lib/data";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMemo, useState } from "react";
import { ProjectForm } from "../Dialogs/projectForm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getTeam } from "../../../actions/team";
import { Project, ProjectApiResponse } from "@/lib/project-data";
import { error } from "console";
import DeleteProject from "../Dialogs/DeleteProject";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

interface TeamMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  };
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

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const project = row.original as Project;
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [openDelete, setOpenDelete] = useState(false);

  const queryClient = useQueryClient();
  const session = useSession();
  const userId = session.data?.user?.id;
  if (!userId) {
    throw new Error("An authrized user");
  }

  // Fetch team data
  const { data: teamData } = useQuery<Team | EmptyTeam>({
    queryKey: ["team"],
    queryFn: async () => {
      const result = await getTeam();
      return result as Team | EmptyTeam;
    },
  });

  // Transform team members data for the ProjectForm
  const teamMembers = useMemo(() => {
    if (!teamData?.members) return [];
    return teamData.members.map((member: TeamMember) => ({
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      image: member.user.image,
    }));
  }, [teamData]);

  const handleProjectUpdate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["projects"] });
    setRefreshKey((prev) => prev + 1);
    setOpen(false);
  };

  // Create initialData object with latest project data
  const initialData = useMemo(
    () => ({
      id: project.id,
      name: project.name,
      description: project.description || "",
      status: project.status,
      priority: project.priority,
      start_date: project.startDate || null,
      due_date: project.endDate || null,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      ownerId: userId,
      owner: {
        id: userId,
        name: session.data?.user?.name || null,
        email: session.data?.user?.email || null,
        image: session.data?.user?.image || null,
      },
      assignedTo: project.teamMembers.map((member) => ({
        user: {
          id: member.id,
          name: member.name,
          email: member.email,
          image: member.avatar || null,
        },
      })),
    }),
    [project, userId, session.data?.user, refreshKey]
  );

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
              setOpen(true);
            }}
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem>Make a copy</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              setOpenDelete(true);
            }}
          >
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProjectForm
        open={open}
        setOpen={setOpen}
        currentUserId={userId}
        teamMembers={teamMembers}
        onSubmit={handleProjectUpdate}
        initialData={initialData}
      />

      <DeleteProject
        open={openDelete}
        setOpen={setOpenDelete}
        projectId={project.id}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["projects"] }); // ✅ Refresh
          setOpenDelete(false);
        }}
      />
    </>
  );
}
