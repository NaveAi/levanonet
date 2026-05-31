import { auth } from "@/lib/auth";
import {
  getAdminDashboard,
  getAllUsers,
  getRecentPostsAdmin,
  getRecentCommentsAdmin,
} from "@/lib/queries";
import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/admin-panel";

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const [dashboard, users, posts, comments] = await Promise.all([
    getAdminDashboard(),
    getAllUsers(),
    getRecentPostsAdmin(),
    getRecentCommentsAdmin(),
  ]);

  return (
    <AdminPanel
      dashboard={dashboard}
      users={users}
      posts={posts}
      comments={comments}
      currentUserId={session.user.id}
      inviteCode={process.env.INVITE_CODE ?? ""}
    />
  );
}
