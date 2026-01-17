import { useState } from "react";
import type { Route } from "./+types/create-bet";
import { EventTypePicker } from "../components/EventTypePicker";
import { OutcomeBuilder } from "../components/OutcomeBuilder";
import { StakeSelector } from "../components/StakeSelector";
import { DeadlinePicker } from "../components/DeadlinePicker";

type Step = "event-type" | "event-details" | "outcomes" | "stake" | "deadline" | "review";

interface BetData {
  eventType: string;
  eventTitle: string;
  eventDescription: string;
  outcomes: { id: string; label: string }[];
  stake: { type: string; description: string };
  deadline: Date | null;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Create a Bet" },
    { name: "description", content: "Set up a new bet with your friends" },
  ];
}

export default function CreateBet() {
  const [step, setStep] = useState<Step>("event-type");
  const [betData, setBetData] = useState<BetData>({
    eventType: "",
    eventTitle: "",
    eventDescription: "",
    outcomes: [],
    stake: { type: "", description: "" },
    deadline: null,
  });

  const handleEventTypeSelect = (type: string) => {
    setBetData({ ...betData, eventType: type });
    setStep("event-details");
  };

  const handleEventDetailsSubmit = () => {
    if (betData.eventTitle.trim()) {
      setStep("outcomes");
    }
  };

  const handleOutcomesSet = (outcomes: { id: string; label: string }[]) => {
    setBetData({ ...betData, outcomes });
    setStep("stake");
  };

  const handleStakeSelect = (stakeType: string, description: string) => {
    setBetData({ ...betData, stake: { type: stakeType, description } });
    setStep("deadline");
  };

  const handleDeadlineSet = (deadline: Date) => {
    setBetData({ ...betData, deadline });
    setStep("review");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8 pt-4">
          <button
            onClick={() => window.history.back()}
            className="text-white/70 hover:text-white mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-white">Create a Bet</h1>
          <div className="flex gap-2 mt-4">
            {(["event-type", "event-details", "outcomes", "stake", "deadline", "review"] as const).map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded transition-colors ${
                  i < (["event-type", "event-details", "outcomes", "stake", "deadline", "review"] as const).indexOf(step) + 1
                    ? "bg-blue-500"
                    : "bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-gradient-to-b from-blue-500/10 to-purple-500/10 border border-white/20 rounded-2xl p-6">
          {step === "event-type" && <EventTypePicker onSelect={handleEventTypeSelect} />}

          {step === "event-details" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-white text-lg">Describe the event</h3>
              <div>
                <input
                  type="text"
                  placeholder="e.g., Raptors vs Lakers (Jan 20)"
                  value={betData.eventTitle}
                  onChange={(e) => setBetData({ ...betData, eventTitle: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 mb-2"
                />
                <textarea
                  placeholder="Add more details (optional)"
                  value={betData.eventDescription}
                  onChange={(e) => setBetData({ ...betData, eventDescription: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 h-20"
                />
              </div>
              <button
                onClick={handleEventDetailsSubmit}
                disabled={!betData.eventTitle.trim()}
                className="w-full px-4 py-3 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 disabled:bg-white/10 disabled:text-white/50 disabled:cursor-not-allowed transition-all"
              >
                Continue
              </button>
            </div>
          )}

          {step === "outcomes" && <OutcomeBuilder onOutcomesSet={handleOutcomesSet} />}

          {step === "stake" && <StakeSelector onSelect={handleStakeSelect} />}

          {step === "deadline" && <DeadlinePicker onDeadlineSet={handleDeadlineSet} />}

          {step === "review" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-white text-lg">Review your bet</h3>

              <div className="space-y-3 bg-white/5 rounded-lg p-4">
                <div>
                  <p className="text-white/70 text-sm">Event</p>
                  <p className="text-white font-medium">{betData.eventTitle}</p>
                  {betData.eventDescription && <p className="text-white/60 text-sm">{betData.eventDescription}</p>}
                </div>

                <div>
                  <p className="text-white/70 text-sm">Possible outcomes</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {betData.outcomes.map((o) => (
                      <span key={o.id} className="px-3 py-1 bg-blue-500/30 text-blue-200 rounded-full text-sm">
                        {o.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-white/70 text-sm">Consequence</p>
                  <p className="text-white font-medium">{betData.stake.description}</p>
                </div>

                <div>
                  <p className="text-white/70 text-sm">Deadline</p>
                  <p className="text-white font-medium">{betData.deadline?.toLocaleString()}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  // TODO: Save bet to database
                  console.log("Creating bet:", betData);
                  alert("Bet created! (feature coming soon)");
                }}
                className="w-full px-4 py-3 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 transition-all"
              >
                Create Bet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
