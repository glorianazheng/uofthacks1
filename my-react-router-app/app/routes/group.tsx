import { Link, useParams } from "react-router";
import type { Route } from "./+types/group";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Group - Bet & Consequence` },
    { name: "description", content: "Group details and bets" },
  ];
}

export default function GroupPage() {
  const { id } = useParams();

  const groupData = {
    name: "House 511",
    members: [
      { id: "1", name: "Jay", emoji: "😎", stats: { wins: 5, losses: 2, streak: 3 } },
      { id: "2", name: "Eva", emoji: "🥳", stats: { wins: 4, losses: 3, streak: -1 } },
      { id: "3", name: "Alex", emoji: "🚀", stats: { wins: 3, losses: 4, streak: 1 } },
      { id: "4", name: "Sam", emoji: "💎", stats: { wins: 2, losses: 5, streak: -2 } },
    ],
    bets: [
      {
        id: "1",
        title: "Raptors vs Lakers",
        status: "locked",
        deadline: new Date(Date.now() + 2 * 60 * 60 * 1000),
      },
      {
        id: "2",
        title: "Love Island: who gets dumped?",
        status: "open",
        deadline: new Date(Date.now() + 12 * 60 * 60 * 1000),
      },
    ],
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8 pt-4">
          <Link to="/dashboard" className="text-white/70 hover:text-white mb-4 inline-block">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-white">{groupData.name}</h1>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link
            to="/create-bet"
            className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/50 text-blue-300 font-semibold text-center hover:bg-blue-500/30 transition-all"
          >
            ➕ New Bet
          </Link>
          <button className="p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-300 font-semibold hover:bg-green-500/30 transition-all">
            📋 Invite Code
          </button>
        </div>

        {/* Scoreboard */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-3">Scoreboard</h2>
          <div className="space-y-2">
            {groupData.members.map((member) => (
              <div key={member.id} className="p-4 rounded-lg bg-white/10 border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{member.emoji}</span>
                    <div>
                      <p className="text-white font-medium">{member.name}</p>
                      <p className="text-white/60 text-sm">
                        {member.stats.wins}W - {member.stats.losses}L
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold ${member.stats.streak > 0 ? "text-green-400" : member.stats.streak < 0 ? "text-red-400" : "text-white/60"}`}
                    >
                      {member.stats.streak > 0 ? "🔥" : member.stats.streak < 0 ? "❄️" : "—"} {Math.abs(member.stats.streak)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Active Bets */}
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Bets in This Group</h2>
          <div className="space-y-3">
            {groupData.bets.map((bet) => (
              <Link
                key={bet.id}
                to={`/bet/${bet.id}`}
                className="block p-4 rounded-lg bg-white/10 border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="flex items-center justify-between">
                  <p className="text-white font-medium">{bet.title}</p>
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
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
