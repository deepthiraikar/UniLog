import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = ((session.user as any)?.role || "").toUpperCase();

  if (role === "ADMIN") redirect("/admin");
  if (role === "FACULTY") redirect("/faculty");
  if (role === "STUDENT") redirect("/student");

  redirect("/login");
}
