import { useState } from "react";

const STAKE_TEMPLATES: Record<string, { label: string; emoji: string }> = {
  dishes: { label: "Dishes", emoji: "🍽️" },
  trash: { label: "Take out trash", emoji: "🗑️" },
  vacuum: { label: "Vacuum", emoji: "🧹" },
  lunch: { label: "Buy lunch", emoji: "🍔" },
  boba: { label: "Buy boba", emoji: "🧋" },
  drive: { label: "Drive next time", emoji: "🚗" },
  cook: { label: "Cook dinner", emoji: "🍳" },
};

interface StakeSelectorProps {
  onSelect: (stakeType: string, description: string) => void;
}

export function StakeSelector({ onSelect }: StakeSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [customStake, setCustomStake] = useState("");

  const handleSelect = (stakeType: string) => {
    setSelected(stakeType);
    onSelect(stakeType, STAKE_TEMPLATES[stakeType].label);
  };

  const handleCustom = () => {
    if (customStake.trim()) {
      setSelected("custom");
      onSelect("custom", customStake);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white text-lg">What's the consequence?</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(STAKE_TEMPLATES).map(([key, { label, emoji }]) => (
          <button
            key={key}
            onClick={() => handleSelect(key)}
            className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
              selected === key
                ? "border-yellow-400 bg-yellow-400/20"
                : "border-white/20 bg-white/10 hover:border-white/40"
            }`}
          >
            <span className="text-2xl">{emoji}</span>
            <span className="text-sm font-medium text-white text-center">{label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Or type your own..."
          value={customStake}
          onChange={(e) => setCustomStake(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
        />
        {customStake.trim() && (
          <button
            onClick={handleCustom}
            className={`w-full p-3 rounded-lg font-medium transition-all ${
              selected === "custom"
                ? "bg-yellow-400 text-black"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Set Custom Stake
          </button>
        )}
      </div>
    </div>
  );
}
