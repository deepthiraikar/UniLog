import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { FacultyDashboard } from "./FacultyDashboard";

export default async function FacultyPage() {
  const session = await auth();
  if (!session?.user || (session.user as any)?.role !== "FACULTY") {
    redirect("/login");
  }

  return (
    <AppShell
      user={{
        name: session.user.name || "Faculty",
        email: session.user.email || "",
        role: "FACULTY",
      }}
    >
      <FacultyDashboard />
    </AppShell>
  );
}
