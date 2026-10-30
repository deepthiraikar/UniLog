import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { NotificationsView } from "@/components/shared/NotificationsView";

export default async function FacultyNotificationsPage() {
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
      <NotificationsView />
    </AppShell>
  );
}
