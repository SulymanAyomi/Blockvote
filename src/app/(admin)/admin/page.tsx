import { redirect } from "next/navigation";

export const metadata = {
  title: "Elections — Admin",
};

export default function AdminPage() {
  redirect("/admin/elections");
}
