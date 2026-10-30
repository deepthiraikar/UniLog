import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { StudentRequestsView } from "./StudentRequestsView";

export default async function StudentRequestsPage() {
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
      <StudentRequestsView />
    </AppShell>
  );
}
