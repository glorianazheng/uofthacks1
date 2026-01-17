import { useState } from "react";

interface OutcomeBuilderProps {
  onOutcomesSet: (outcomes: { id: string; label: string }[]) => void;
}

export function OutcomeBuilder({ onOutcomesSet }: OutcomeBuilderProps) {
  const [outcomes, setOutcomes] = useState<string[]>(["", ""]);

  const handleOutcomeChange = (index: number, value: string) => {
    const newOutcomes = [...outcomes];
    newOutcomes[index] = value;
    setOutcomes(newOutcomes);
  };

  const handleAddOutcome = () => {
    setOutcomes([...outcomes, ""]);
  };

  const handleRemoveOutcome = (index: number) => {
    const newOutcomes = outcomes.filter((_, i) => i !== index);
    setOutcomes(newOutcomes);
  };

  const handleConfirm = () => {
    const validOutcomes = outcomes
      .filter((o) => o.trim())
      .map((label, index) => ({
        id: `outcome-${index}`,
        label,
      }));

    if (validOutcomes.length >= 2) {
      onOutcomesSet(validOutcomes);
    }
  };

  const filledCount = outcomes.filter((o) => o.trim()).length;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white text-lg">What are the outcomes?</h3>
      <p className="text-white/70 text-sm">Add at least 2 possible outcomes</p>

      <div className="space-y-2">
        {outcomes.map((outcome, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              placeholder={`Outcome ${index + 1}`}
              value={outcome}
              onChange={(e) => handleOutcomeChange(index, e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
            />
            {outcomes.length > 2 && (
              <button
                onClick={() => handleRemoveOutcome(index)}
                className="px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleAddOutcome}
        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
      >
        + Add another outcome
      </button>

      <button
        onClick={handleConfirm}
        disabled={filledCount < 2}
        className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
          filledCount >= 2
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-white/10 text-white/50 cursor-not-allowed"
        }`}
      >
        Continue with {filledCount} outcomes
      </button>
    </div>
  );
}
