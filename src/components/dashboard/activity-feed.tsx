"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, CheckCircle, Clock, FileEdit } from "lucide-react";
import { useEffect, useState } from "react";
import { ActivityItem, getActivityFeed } from "@/lib/activity-data";
import { formatRelativeTime, getInitials } from "@/utils/date-utils";
import { checkUserPremium } from "@/lib/project-tasks";

// Function to render the appropriate icon for each activity type
function getActivityIcon(type: string) {
  switch (type) {
    case "comment":
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case "task":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "update":
      return <FileEdit className="h-4 w-4 text-amber-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is premium
        const premium = await checkUserPremium();
        setIsPremium(premium);

        // Fetch activity data
        const data = await getActivityFeed(10);
        setActivities(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch activity data:", err);
        setError("Failed to load activity data");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-3">
        <CardTitle>Team Activity</CardTitle>
        <CardDescription>Recent updates from your team</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex flex-col gap-4 px-6 pb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/3 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 px-6 text-muted-foreground">
            {error}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 px-6 text-muted-foreground">
            No recent activity found
          </div>
        ) : !isPremium ? (
          <div className="text-center py-8 px-6 flex flex-col items-center">
            <p className="text-muted-foreground mb-4">
              Upgrade to Premium to see team activity
            </p>
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded text-sm">
              Upgrade to Premium
            </button>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="px-6 pb-6 divide-y divide-border">
              {activities.slice(-5).map((activity, index) => (
                <div
                  key={activity.id}
                  className={`py-4 ${index === 0 ? "pt-0" : ""}`}
                >
                  <div className="flex gap-3 text-sm">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage
                        src={activity.userImage || ""}
                        alt={activity.userName}
                      />
                      <AvatarFallback>
                        {getInitials(activity.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{activity.userName}</span>
                        {activity.userRole === "Team_Member" && (
                          <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                            Team
                          </span>
                        )}
                        <span className="flex items-center text-xs text-muted-foreground">
                          {formatRelativeTime(activity.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{getActivityIcon(activity.type)}</span>
                        <span>
                          <span className="text-muted-foreground">
                            {activity.action}
                          </span>{" "}
                          <span className="font-medium">
                            {activity.targetName}
                          </span>
                          {activity.projectName && (
                            <>
                              {" "}
                              <span className="text-muted-foreground">
                                in
                              </span>{" "}
                              <span className="font-medium">
                                {activity.projectName}
                              </span>
                            </>
                          )}
                        </span>
                      </div>
                      {activity.comment && (
                        <div className="mt-2 rounded-md border bg-muted/50 p-2 text-xs">
                          {activity.comment}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
