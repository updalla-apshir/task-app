import React from "react";
import { Feature } from "./kanban";

type ProgressToolbarProps = {
  tasks: Feature[];
};

const priorityOrder = ["High", "Medium", "Low"] as const;

const priorityColors = {
  Low: "#34D399", // green-400
  Medium: "#FBBF24", // yellow-400
  High: "#EF4444", // red-500
};

export const ProgressToolbar = ({ tasks }: ProgressToolbarProps) => {
  const totalTasks = tasks.length;

  // Count tasks by status
  const statusCounts = {
    Pending: 0,
    "In Progress": 0,
    Completed: 0,
  };

  tasks.forEach((task) => {
    if (task.status.name === "Planned") statusCounts.Pending++;
    else if (task.status.name === "In Progress") statusCounts["In Progress"]++;
    else if (task.status.name === "Done") statusCounts.Completed++;
  });

  // Calculate % for progress bars
  const getPercent = (count: number) =>
    totalTasks === 0 ? 0 : Math.round((count / totalTasks) * 100);

  // Count by priority
  const priorityCounts = {
    Low: 0,
    Medium: 0,
    High: 0,
  };
  tasks.forEach((task) => priorityCounts[task.priority]++);

  function cn(arg0: string, arg1: string): string | undefined {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="mb-6 p-4 bg-white rounded shadow flex flex-col gap-4">
      <h2 className="font-semibold text-lg">Task Progress</h2>
      <div className="flex gap-6">
        {(["Pending", "In Progress", "Completed"] as const).map((status) => (
          <div key={status} className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="font-medium">{status}</span>
              <span>{getPercent(statusCounts[status])}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded h-4">
              <div
                className={cn(
                  "h-4 rounded",
                  status === "Pending"
                    ? "bg-gray-400"
                    : status === "In Progress"
                      ? "bg-yellow-400"
                      : "bg-green-400"
                )}
                style={{ width: `${getPercent(statusCounts[status])}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <h3 className="font-semibold text-md mt-4">Priority Levels</h3>
      <div className="flex gap-4 justify-center">
        {priorityOrder.map((priority) => (
          <div key={priority} className="flex items-center gap-2">
            <span
              className="inline-block w-4 h-4 rounded-full"
              style={{ backgroundColor: priorityColors[priority] }}
            />
            <span className="font-medium">{priority}</span>
            <span className="text-sm text-gray-600">
              ({priorityCounts[priority]})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
