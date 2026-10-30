import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { StudentDashboard } from "./StudentDashboard";

export default async function StudentPage() {
  const session = await auth();
  if (!session?.user || (session.user as any)?.role !== "STUDENT") {
    redirect("/login");
  }

  return (
    <AppShell
      user={{
        name: session.user.name || "Student",
        email: session.user.email || "",
        role: "STUDENT",
      }}
    >
      <StudentDashboard />
    </AppShell>
  );
}
