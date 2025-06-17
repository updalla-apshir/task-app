"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { defaultProjects, Project } from "@/lib/project-data";
import { format } from "date-fns";
import { getTasksForUser } from "../../../actions/task";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function ActiveProjects() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  
  // Fetch projects data
  const {
    data: projects = [],
    isLoading,
    isError,
  } = useQuery<Project[]>({
    queryKey: ["projects", userId],
    queryFn: () => userId ? defaultProjects(userId) : Promise.resolve([]),
    retry: 2,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    enabled: !!userId,
  });
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (userId) {
      getTasksForUser(userId).then((result) => {
        setTasks(result || []);
      });
    }
  }, [userId]);

  // Example: Find projects that have at least one task
  const tasksWithProject = projects.filter((project) =>
    tasks.some((task) => task.project?.id === project.id)
  );

  // Filter to only active projects and sort by progress (least to most)
  const activeProjects = projects
    .filter((project) => project.status !== "completed")
    .map((project) => {
      const relatedTasks = tasks.filter(
        (task) => task.project?.id === project.id
      );

      const completedTasks = relatedTasks.filter(
        (task) => task.status === "completed"
      );

      const progress = relatedTasks.length
        ? Math.round((completedTasks.length / relatedTasks.length) * 100)
        : 0;

      return {
        ...project,
        progress,
        taskCount: relatedTasks.length,
        completedCount: completedTasks.length,
      };
    })
    .sort((a, b) => a.progress - b.progress)
    .slice(-2); // Show last 2 active projects

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle>Active Projects</CardTitle>
        <CardDescription>Overview of your active projects</CardDescription>
      </CardHeader>
      <CardContent className="p-0 pt-0">
        {isLoading ? (
          <div className="flex flex-col gap-4 px-6 pb-6">
            <div className="h-20 rounded-lg bg-muted animate-pulse"></div>
            <div className="h-20 rounded-lg bg-muted animate-pulse"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-4 px-6 text-muted-foreground">
            Failed to load projects
          </div>
        ) : activeProjects.length === 0 ? (
          <div className="text-center py-4 px-6 text-muted-foreground">
            No active projects found
          </div>
        ) : (
          <div className="flex flex-col divide-y">
            {activeProjects.map((project) => (
              <div key={project.id} className="flex flex-col space-y-2 p-6">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{project.name}</div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full ${
                      project.progress >= 75
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : project.progress >= 40
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {project.progress >= 75
                      ? "On Track"
                      : project.progress >= 40
                        ? "At Risk"
                        : "Behind"}
                  </div>
                </div>

                <Progress value={project.progress} className="h-2" />

                <div className="flex justify-between text-sm text-muted-foreground">
                  <div>{project.progress}% complete</div>
                  <div>Target: {Math.min(project.progress + 10, 100)}%</div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {project.teamMembers && project.teamMembers.length > 0 ? (
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage
                          src={project.teamMembers[0].avatar || ""}
                          alt={project.teamMembers[0].name || "Team Member"}
                        />
                        <AvatarFallback>
                          {project.teamMembers[0].name
                            ? project.teamMembers[0].name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                            : "TM"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        {project.teamMembers[0].name || "Team Member"}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No team assigned
                    </div>
                  )}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarDays className="mr-1 h-4 w-4" />
                    <span>
                      {project.endDate
                        ? `Due ${format(new Date(project.endDate), "MMM d, yyyy")}`
                        : "No deadline"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
