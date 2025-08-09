import { api } from "~/trpc/server";
import TeamAdminPage from "./AdminTeamPage";

export default async function Page() {
  const teams = await api.admin.getAllTeams();

  return (
    <div>
      <TeamAdminPage teams={teams} />
    </div>
  );
}
