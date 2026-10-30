import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { NotificationsView } from "@/components/shared/NotificationsView";

export default async function StudentNotificationsPage() {
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
      <NotificationsView />
    </AppShell>
  );
}
