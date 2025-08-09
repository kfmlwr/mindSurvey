import { api } from "~/trpc/server";
import AdminUsersPage from "./AdminUsersPage";

export default async function UsersPage() {
  const users = await api.admin.getAllUsers();
  
  return <AdminUsersPage users={users} />;
}