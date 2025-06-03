export interface User {
  id: string;
  name: string | null;
  email: string | null;
  password: string | null;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  enableTwoFactorAuthentication: boolean;
  role: Role;
}

export enum Role {
  User = "User",
  Premium = "Premium",
  Team_Member = "Team_Member",
}
