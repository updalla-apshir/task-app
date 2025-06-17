"use client";

import { Card, CardContent } from "@/components/ui/card";
import { defaultProjects, Project } from "@/lib/project-data";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, Users, Clock } from "lucide-react";
import { getAllTasksForUser, checkUserPremium } from "@/lib/project-tasks";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

// Example mock-up of inferred project structure
// type Project = {
//   id: string;
//   status: "active" | "completed";
//   tasks: { status: "pending" | "done" }[];
//   team: { name: string; id: string }[];
//   hoursTracked: number;
// };

// Type augmentation to address missing properties
interface ProjectWithStats extends Project {
  tasks?: { status: "pending" | "done" }[];
  team?: { name: string; id: string }[];
  hoursTracked?: number;
}

export function StatsCards() {
  const [isPremium, setIsPremium] = useState(false);
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Fetch premium status on component mount
  useEffect(() => {
    const checkPremium = async () => {
      const premium = await checkUserPremium();
      setIsPremium(premium);
    };
    checkPremium();
  }, []);

  // Fetch projects data
  const {
    data: projects = [],
    isLoading: isLoadingProjects,
    isError: isProjectsError,
  } = useQuery<ProjectWithStats[]>({
    queryKey: ["projects", userId],
    queryFn: () => userId ? defaultProjects(userId) : Promise.resolve([]),
    retry: 2,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    enabled: !!userId,
  });

  // Fetch tasks data
  const {
    data: tasks = [],
    isLoading: isLoadingTasks,
    isError: isTasksError,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: getAllTasksForUser,
    retry: 2,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    enabled: isPremium, // Only fetch if user is premium
  });

  // Calculated stats
  const totalProjects = projects.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const pendingTasks = tasks.length - completedTasks;

  // Calculate unique team members across all projects
  const totalTeamMembers = new Set(
    projects.flatMap((p) => p.teamMembers?.map((m) => m.id) || [])
  ).size;

  // Calculate total hours tracked (from all projects with available data)
  const totalHoursTracked = projects.reduce((acc, p) => {
    // If a project has a start and end date, calculate hours between them
    if (p.startDate && p.endDate) {
      const start = new Date(p.startDate).getTime();
      const end = new Date(p.endDate).getTime();
      const diffHours = Math.round((end - start) / (1000 * 60 * 60));
      return acc + diffHours;
    }
    return acc;
  }, 0);

  const stats = [
    {
      title: "Total Projects",
      value: isLoadingProjects ? "..." : totalProjects.toString(),
      description: "Active projects",
      icon: <CalendarDays className="h-4 w-4 text-muted-foreground" />,
      change: "+2", // Optional: calculate based on previous fetch
      changeType: "increase",
    },
    {
      title: "Completed Tasks",
      value: isLoadingTasks ? "..." : completedTasks.toString(),
      description: "This month",
      icon: <CheckCircle2 className="h-4 w-4 text-muted-foreground" />,
      change: `${pendingTasks} pending`,
      changeType: "increase",
    },
    {
      title: "Team Members",
      value: isLoadingProjects ? "..." : totalTeamMembers.toString(),
      description: isPremium ? "Active members" : "Upgrade for team features",
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      change: isPremium ? "+1" : "Upgrade",
      changeType: isPremium ? "increase" : "neutral",
    },
    {
      title: "Hours Tracked",
      value: isLoadingProjects ? "..." : totalHoursTracked.toString(),
      description: "Estimated hours",
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
      change: isPremium ? "+12%" : "Upgrade for analytics",
      changeType: isPremium ? "increase" : "neutral",
    },
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  {stat.icon}
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                </div>
                <div className="flex items-end gap-1">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground pb-1">
                    {stat.description}
                  </p>
                </div>
              </div>
              <div
                className={`flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium
                ${
                  stat.changeType === "increase"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : stat.changeType === "decrease"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 mx-2"
                }`}
              >
                {stat.change}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
