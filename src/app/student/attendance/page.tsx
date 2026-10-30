import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import { StudentAttendanceView } from "./StudentAttendanceView";

export default async function StudentAttendancePage() {
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
      <StudentAttendanceView />
    </AppShell>
  );
}
