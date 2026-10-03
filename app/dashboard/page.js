import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import DashboardClient from "./DashboardClient";

export default function DashboardPage() {
  const me = getCurrentUser();
  if (!me) {
    redirect("/login");
  }
  return <DashboardClient me={me} />;
}
