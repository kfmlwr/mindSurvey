import { Link } from "~/i18n/navigation";
import { api } from "~/trpc/server";

export default async function TeamPage() {
  const teams = await api.team.listTeams();

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
      <h1 className="mb-4 text-2xl font-bold">Your Teams</h1>
      <ul>
        {teams.map((team) => (
          <li key={team.id} className="mb-2">
            <Link
              href={`/team/${team.id}`}
              className="text-blue-600 hover:underline"
            >
              {team.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
