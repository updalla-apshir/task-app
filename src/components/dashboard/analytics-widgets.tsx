"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { defaultProjects, Project } from "@/lib/project-data";
import { getAllTasksForUser, checkUserPremium } from "@/lib/project-tasks";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function AnalyticsWidgets() {
  const [isPremium, setIsPremium] = useState(false);
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Fetch premium status
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
  } = useQuery<Project[]>({
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

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Group tasks by project for project timeline chart
  const projectTaskData = projects
    .filter((project) => {
      const hasTime = calculateTimeSpent(project) > 0;
      return hasTime;
    })
    .slice(-3) // or .slice(-5)
    .map((project) => {
      const projectTasks = tasks.filter(
        (task) => task.project_id === project.id
      );
      const completedProjectTasks = projectTasks.filter(
        (task) => task.status === "completed"
      ).length;

      return {
        id: project.id,
        name: project.name,
        completed: completedProjectTasks,
        pending: projectTasks.length - completedProjectTasks,
        timeSpent: calculateTimeSpent(project),
      };
    });

  // Calculate time spent for a project (in hours)
  function calculateTimeSpent(project: Project) {
    if (project.startDate && project.endDate) {
      const start = new Date(project.startDate).getTime();
      const end = new Date(project.endDate).getTime();
      return Math.round((end - start) / (1000 * 60 * 60));
    }
    return 0;
  }

  // Total time spent across all projects
  const totalTimeSpent = projectTaskData.reduce(
    (acc, project) => acc + project.timeSpent,
    0
  );

  // Function to create a simple pie chart for task completion
  function TaskCompletionChart() {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const completedOffset = circumference * (1 - completionRate / 100);

    return (
      <div className="flex items-center justify-center">
        <div className="relative h-28 w-28">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-muted"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-primary"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={completedOffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold">{completionRate}%</span>
            <span className="text-xs text-muted-foreground">Completed</span>
          </div>
        </div>
      </div>
    );
  }

  // Function to create a simple bar chart for project timeline
  function ProjectTimelineChart() {
    return (
      <div className="space-y-4">
        {projectTaskData.map((project) => (
          <div key={project.id} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{project.name}</span>
              <span>
                {project.completed} / {project.completed + project.pending}{" "}
                tasks
              </span>
            </div>
            <div className="flex h-2 overflow-hidden rounded bg-muted">
              <div
                className="bg-primary"
                style={{
                  width:
                    project.completed + project.pending > 0
                      ? `${(project.completed / (project.completed + project.pending)) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Function to create a simple bar chart for time spent per project
  function TimeSpentChart() {
    return (
      <div className="space-y-4">
        {projectTaskData.map((project) => (
          <div key={project.id} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{project.name}</span>
              <span>
                {totalTimeSpent > 0
                  ? `${Math.round((project.timeSpent / totalTimeSpent) * 100)}%`
                  : "0%"}
              </span>
            </div>
            <div className="flex h-2 overflow-hidden rounded bg-muted">
              <div
                className="bg-primary"
                style={{
                  width:
                    totalTimeSpent > 0
                      ? `${(project.timeSpent / totalTimeSpent) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Show placeholder when data is loading
  if (isLoadingProjects || isLoadingTasks) {
    return (
      <>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Task Completion</CardTitle>
            <CardDescription>Loading data...</CardDescription>
          </CardHeader>
          <CardContent className="h-48 flex items-center justify-center">
            <div className="h-28 w-28 rounded-full bg-muted animate-pulse"></div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Project Timeline</CardTitle>
            <CardDescription>Loading data...</CardDescription>
          </CardHeader>
          <CardContent className="h-48 space-y-4">
            <div className="h-6 rounded bg-muted animate-pulse"></div>
            <div className="h-6 rounded bg-muted animate-pulse"></div>
            <div className="h-6 rounded bg-muted animate-pulse"></div>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Time Distribution</CardTitle>
            <CardDescription>Loading data...</CardDescription>
          </CardHeader>
          <CardContent className="h-48 space-y-4">
            <div className="h-6 rounded bg-muted animate-pulse"></div>
            <div className="h-6 rounded bg-muted animate-pulse"></div>
            <div className="h-6 rounded bg-muted animate-pulse"></div>
          </CardContent>
        </Card>
      </>
    );
  }

  // Show premium upgrade message if user is not premium
  if (!isPremium) {
    return (
      <>
        <Card className="col-span-1 md:col-span-3 lg:col-span-3">
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>
              Upgrade to Premium to access detailed analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="h-48 flex flex-col items-center justify-center">
            <p className="text-muted-foreground mb-4">
              Get insights into task completion rates, project timelines, and
              time distribution
            </p>
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded">
              Upgrade to Premium
            </button>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Task Completion</CardTitle>
          <CardDescription>Completed vs. pending tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <TaskCompletionChart />

          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{completedTasks}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {totalTasks - completedTasks}
              </div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
          <CardDescription>Progress of active projects</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectTimelineChart />
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Time Distribution</CardTitle>
          <CardDescription>Hours spent per project</CardDescription>
        </CardHeader>
        <CardContent>
          <TimeSpentChart />
        </CardContent>
      </Card>
    </>
  );
}
