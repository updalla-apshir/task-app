import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
}

interface TeamMemberData {
  user: User;
}

interface Team {
  members: TeamMemberData[];
}

interface TeamMemberProps {
  members: TeamMemberData[];
}

export const TeamMember = ({ members }: TeamMemberProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {members.map((member) => (
        <Card key={member.user.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.user.image || undefined} alt={member.user.name || ''} />
              <AvatarFallback>
                {member.user.name
                  ? member.user.name.split(" ").map((n) => n[0]).join("")
                  : "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold leading-none">{member.user.name || 'Unnamed Member'}</h3>
              <p className="text-sm text-muted-foreground">{member.user.role}</p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{member.user.email || 'No email'}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}; 