import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import type { Route } from "./+types/bet";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: "Bet Details" },
    { name: "description", content: "View and join a bet" },
  ];
}

export default function BetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(50);
  const [isJoining, setIsJoining] = useState(false);

  // Mock bet data
  const bet = {
    id,
    title: "Raptors vs Lakers",
    description: "NBA game on January 20, 2025",
    outcomes: [
      { id: "outcome-0", label: "Raptors win", picks: 4 },
      { id: "outcome-1", label: "Lakers win", picks: 3 },
    ],
    stake: "Buy lunch for the group 🍔",
    deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: "open",
    hostName: "Jay 😎",
    timeUntilLock: Math.round((24 * 60 * 60 * 1000) / (60 * 1000)), // minutes
  };

  const handleJoinBet = () => {
    if (selectedOutcome) {
      setIsJoining(true);
      setTimeout(() => {
        // TODO: Add bet pick to database
        console.log("Joined bet with:", { outcomeId: selectedOutcome, confidence });
        alert(`You picked "${bet.outcomes.find((o) => o.id === selectedOutcome)?.label}" with ${confidence}% confidence!`);
        setIsJoining(false);
        navigate("/dashboard");
      }, 1000);
    }
  };

  const totalPicks = bet.outcomes.reduce((sum, o) => sum + o.picks, 0);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="text-white/70 hover:text-white mb-4 inline-block"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-white">{bet.title}</h1>
          <p className="text-white/60 text-sm mt-1">{bet.description}</p>
        </div>

        {/* Bet Info Card */}
        <div className="bg-gradient-to-b from-blue-500/10 to-purple-500/10 border border-white/20 rounded-2xl p-6 mb-6 space-y-4">
          <div>
            <p className="text-white/70 text-sm">Host</p>
            <p className="text-white font-medium">{bet.hostName}</p>
          </div>

          <div>
            <p className="text-white/70 text-sm">Consequence (loser pays)</p>
            <p className="text-white font-medium">{bet.stake}</p>
          </div>

          <div>
            <p className="text-white/70 text-sm mb-2">Betting closes in</p>
            <div className="bg-white/10 border border-white/20 rounded-lg p-3">
              <p className="text-white font-bold text-lg">
                {Math.floor(bet.timeUntilLock / 60)}h {bet.timeUntilLock % 60}m
              </p>
              <p className="text-white/60 text-xs">{bet.deadline.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Outcomes & Current Picks */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">Current Picks</h2>
          <div className="space-y-3">
            {bet.outcomes.map((outcome) => {
              const percentage = totalPicks > 0 ? Math.round((outcome.picks / totalPicks) * 100) : 50;
              return (
                <button
                  key={outcome.id}
                  onClick={() => setSelectedOutcome(selectedOutcome === outcome.id ? null : outcome.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedOutcome === outcome.id
                      ? "border-blue-400 bg-blue-400/20"
                      : "border-white/20 bg-white/10 hover:border-white/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">{outcome.label}</p>
                    <span className="text-white/70 text-sm">{outcome.picks} people</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-white/60 text-xs mt-2">{percentage}% picked this</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Join Section */}
        {selectedOutcome && (
          <section className="mb-6 bg-gradient-to-b from-green-500/10 to-teal-500/10 border border-white/20 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Your Confidence</h2>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/70 text-sm">How sure are you?</p>
                <p className="text-white font-bold text-lg">{confidence}%</p>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-green-500"
              />
              <p className="text-white/60 text-xs mt-2">
                {confidence < 50
                  ? "Not very sure"
                  : confidence === 50
                    ? "50/50"
                    : confidence < 80
                      ? "Pretty confident"
                      : "Very confident"}
              </p>
            </div>

            <button
              onClick={handleJoinBet}
              disabled={isJoining}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoining ? "Joining..." : "Join This Bet 🎲"}
            </button>
          </section>
        )}

        {!selectedOutcome && (
          <div className="p-4 rounded-lg bg-white/10 border border-white/20 text-center">
            <p className="text-white/70">Pick an outcome above to join this bet</p>
          </div>
        )}
      </div>
    </div>
  );
}
