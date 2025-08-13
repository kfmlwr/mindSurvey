import { HydrateClient } from "~/trpc/server";
import AdminTagsPage from "./AdminTagsPage";

export default async function AdminTagsPageRoute() {
  return (
    <HydrateClient>
      <AdminTagsPage />
    </HydrateClient>
  );
}