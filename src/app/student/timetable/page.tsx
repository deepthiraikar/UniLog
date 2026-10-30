import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { StudentTimetableView } from "./StudentTimetableView";

export default async function StudentTimetablePage() {
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
      <StudentTimetableView />
    </AppShell>
  );
}
