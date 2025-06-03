"use client";

import * as React from "react";
import { Check, ChevronsUpDown, UserPlus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Role } from "@/types/user";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface TeamMember {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface AssigneeSelectProps {
  value: string;
  onChange: (value: string) => void;
  teamMembers?: TeamMember[];
  currentUserId: string;
  onRedirectToTeam?: () => void;
  disabled?: boolean;
}

export function AssigneeSelect({
  value,
  onChange,
  teamMembers = [],
  currentUserId,
  onRedirectToTeam,
  disabled = false,
}: AssigneeSelectProps) {
  const { data: session } = useSession();
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const commandRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  const userRole = session?.user?.role ?? Role.User;
  const isPremiumUser = userRole === Role.Premium;

  // Handle keyboard navigation
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // For regular users, show a simple "Assigned to You" badge with improved styling
  if (!isPremiumUser) {
    return (
      <div 
        className="flex items-center gap-2 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        role="status"
        aria-label="Task assigned to you"
      >
        <Avatar className="h-6 w-6 transition-transform hover:scale-105">
          <AvatarImage src={session?.user?.image ?? ""} alt={session?.user?.name ?? "User avatar"} />
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

  const selectedMember = teamMembers.find((member) => member.id === value);
  const filteredMembers = teamMembers.filter((member) => 
    member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select team member"
          className={cn(
            "w-full justify-between transition-all duration-200",
            "hover:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            !value && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          {selectedMember ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 transition-transform hover:scale-105">
                <AvatarImage src={selectedMember.image ?? ""} alt={selectedMember.name ?? "Member avatar"} />
                <AvatarFallback>
                  {selectedMember.name?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <span>{selectedMember.name}</span>
              {selectedMember.id === currentUserId && (
                <Badge variant="secondary" className="ml-2">You</Badge>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Select team member</span>
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform duration-200" 
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[300px] p-0" 
        align="start"
        sideOffset={5}
      >
        <Command 
          ref={commandRef}
          className="rounded-lg border shadow-md"
        >
          <CommandInput
            placeholder="Search team member..."
            className="h-9"
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty className="p-6 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                No team member found
              </p>
            </CommandEmpty>
            <CommandGroup heading="Team Members">
              {filteredMembers.map((member) => (
                <CommandItem
                  key={member.id}
                  value={member.id}
                  onSelect={() => {
                    onChange(member.id);
                    setOpen(false);
                    setSearchQuery("");
                  }}
                  className="text-sm transition-colors hover:bg-accent"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Avatar className="h-6 w-6 transition-transform hover:scale-105">
                      <AvatarImage src={member.image ?? ""} alt={member.name ?? "Member avatar"} />
                      <AvatarFallback>
                        {member.name?.[0]?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span>{member.name}</span>
                      {member.email && (
                        <span className="text-xs text-muted-foreground">{member.email}</span>
                      )}
                    </div>
                  </div>
                  {member.id === currentUserId && (
                    <Badge variant="secondary" className="ml-2">You</Badge>
                  )}
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4 transition-opacity",
                      value === member.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}