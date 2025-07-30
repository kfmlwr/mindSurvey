import { api } from "~/trpc/server";
import TeamPage from "./TeamPage";

export default async function Page() {
  const teams = await api.team.listTeams();

  return (
    <div className="mx-auto max-w-6xl">
      <TeamPage teams={teams} />
    </div>
  );
}
