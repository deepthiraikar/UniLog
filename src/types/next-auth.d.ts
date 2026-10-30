import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "FACULTY" | "STUDENT";
      studentProfileId?: string;
      facultyProfileId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "ADMIN" | "FACULTY" | "STUDENT";
    studentProfileId?: string;
    facultyProfileId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "FACULTY" | "STUDENT";
    studentProfileId?: string;
    facultyProfileId?: string;
  }
}
