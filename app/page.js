import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default function Home() {
  const user = getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }
  redirect("/login");
}
