"use client";

import * as React from "react";
import { X, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Role } from "@/types/user";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TeamMember {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface AssigneeSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  teamMembers?: TeamMember[];
  currentUserId: string;
  onRedirectToTeam?: () => void;
}

export function AssigneeSelect({
  value = [],
  onChange,
  teamMembers = [],
  currentUserId,
  onRedirectToTeam,
}: AssigneeSelectProps) {
  const { data: session } = useSession();
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const userRole = session?.user?.role ?? Role.User;
  const isPremiumUser = userRole === Role.Premium;

  // For regular users, show a simple "Assigned to You" badge with improved styling
  if (!isPremiumUser) {
    return (
      <div
        className="flex items-center gap-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        role="status"
        aria-label="Task assigned to you"
      >
        <Avatar className="h-6 w-6 transition-transform hover:scale-105">
          <AvatarImage
            src={session?.user?.image ?? ""}
            alt={session?.user?.name ?? "User avatar"}
          />
          <AvatarFallback>
            {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <span className="text-muted-foreground">Assigned to You</span>
      </div>
    );
  }

  // For premium users with no team members
  if (teamMembers.length === 0) {
    return (
      <Button
        variant="outline"
        className="w-full justify-start text-left font-normal group transition-all duration-200 hover:border-primary"
        onClick={onRedirectToTeam}
        aria-label="Add team members to start assigning tasks"
      >
        <UserPlus className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
        <span className="flex-1">Add team members to assign tasks</span>
        <Badge variant="secondary" className="ml-2">
          Premium Feature
        </Badge>
      </Button>
    );
  }

  const selectedMembers = teamMembers.filter((member) =>
    value.includes(member.id)
  );

  const handleToggleMember = (memberId: string) => {
    const newValue = value.includes(memberId)
      ? value.filter((id) => id !== memberId)
      : [...value, memberId];
    onChange(newValue);
  };

  const handleRemoveMember = (memberId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((id) => id !== memberId));
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select team members"
            className="w-full justify-between"
            onClick={() => setOpen(!open)}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                {selectedMembers.length === 0
                  ? "Select team members"
                  : `${selectedMembers.length} member${selectedMembers.length === 1 ? "" : "s"} selected`}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <ScrollArea className="h-[300px] p-4">
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-accent rounded-lg p-2"
                  onClick={() => handleToggleMember(member.id)}
                >
                  <Checkbox
                    checked={value.includes(member.id)}
                    onCheckedChange={() => handleToggleMember(member.id)}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={member.image ?? ""}
                        alt={member.name ?? "Member avatar"}
                      />
                      <AvatarFallback>
                        {member.name?.[0]?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span>{member.name}</span>
                      {member.email && (
                        <span className="text-xs text-muted-foreground">
                          {member.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Selected members display */}
      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border rounded-md">
          {selectedMembers.map((member) => (
            <Badge
              key={member.id}
              variant="secondary"
              className="flex items-center gap-1 py-1 px-2"
            >
              <Avatar className="h-4 w-4">
                <AvatarImage
                  src={member.image ?? ""}
                  alt={member.name ?? "Member avatar"}
                />
                <AvatarFallback>
                  {member.name?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <span>{member.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={(e) => handleRemoveMember(member.id, e)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
