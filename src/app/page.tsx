import { redirect } from "next/navigation";

// The interactive intro will live here later. Until then, go straight to the index.
export default function Home() {
  redirect("/projects");
}
