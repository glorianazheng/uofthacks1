import { Link } from "react-router";
import type { Route } from "./+types/dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard" },
    { name: "description", content: "Your bets and scoreboard" },
  ];
}

export default function Dashboard() {
  // TODO: Load real data
  const userGroups = [
    { id: "1", name: "House 511", members: 4 },
    { id: "2", name: "Roommates", members: 3 },
  ];

  const activeBets = [
    {
      id: "1",
      title: "Raptors vs Lakers",
      stake: "Buy lunch",
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      yourPick: "Raptors",
      status: "open",
    },
    {
      id: "2",
      title: "Love Island: who gets dumped?",
      stake: "Dishes",
      deadline: new Date(Date.now() + 12 * 60 * 60 * 1000),
      yourPick: "Person A",
      status: "locked",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8 pt-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Bet & Consequence</h1>
            <div className="text-3xl">🎲</div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/create-bet"
              className="p-4 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-center hover:shadow-lg transition-all"
            >
              ➕ New Bet
            </Link>
            <Link
              to="/join-group"
              className="p-4 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 text-white font-semibold text-center hover:shadow-lg transition-all"
            >
              🤝 Join Group
            </Link>
          </div>
        </div>

        {/* Groups Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-3">Your Groups</h2>
          <div className="space-y-2">
            {userGroups.map((group) => (
              <Link
                key={group.id}
                to={`/group/${group.id}`}
                className="block p-4 rounded-lg bg-white/10 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{group.name}</p>
                    <p className="text-white/60 text-sm">{group.members} members</p>
                  </div>
                  <span className="text-2xl">👥</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Active Bets Section */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Active Bets</h2>
          <div className="space-y-3">
            {activeBets.map((bet) => (
              <div
                key={bet.id}
                className="p-4 rounded-lg bg-white/10 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-white font-medium">{bet.title}</p>
                    <p className="text-white/60 text-sm">
                      Your pick: <span className="text-blue-300">{bet.yourPick}</span>
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      bet.status === "open"
                        ? "bg-green-500/30 text-green-200"
                        : "bg-yellow-500/30 text-yellow-200"
                    }`}
                  >
                    {bet.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>⏱️ Closes in {Math.round((bet.deadline.getTime() - Date.now()) / (60 * 60 * 1000))}h</span>
                  <span>Consequence: {bet.stake}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
