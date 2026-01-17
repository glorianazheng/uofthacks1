import { useState } from "react";

interface EventTypeOption {
  value: string;
  label: string;
  emoji: string;
  examples: string[];
}

const EVENT_TYPES: EventTypeOption[] = [
  {
    value: "sports",
    label: "Sports",
    emoji: "🏀",
    examples: ["Raptors vs Lakers", "World Cup final"],
  },
  {
    value: "entertainment",
    label: "TV/Entertainment",
    emoji: "📺",
    examples: ["Love Island: who gets dumped?", "Oscar winner"],
  },
  {
    value: "weather",
    label: "Weather",
    emoji: "🌧️",
    examples: ["Will it rain tomorrow?", "Snow this week?"],
  },
  {
    value: "custom",
    label: "Custom",
    emoji: "🎲",
    examples: ["Who shows up late first?", "Who scores first in Mario Kart?"],
  },
];

interface EventTypeSelector {
  onSelect: (type: string) => void;
}

export function EventTypePicker({ onSelect }: EventTypeSelector) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (type: string) => {
    setSelected(type);
    onSelect(type);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white text-lg">What type of event?</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {EVENT_TYPES.map(({ value, label, emoji }) => (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
              selected === value
                ? "border-blue-400 bg-blue-400/20"
                : "border-white/20 bg-white/10 hover:border-white/40"
            }`}
          >
            <span className="text-2xl">{emoji}</span>
            <span className="text-sm font-medium text-white">{label}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="bg-white/10 border border-white/20 rounded-lg p-4">
          <p className="text-white/70 text-sm mb-2">Examples:</p>
          <ul className="space-y-1">
            {EVENT_TYPES.find((t) => t.value === selected)?.examples.map((ex, i) => (
              <li key={i} className="text-white text-sm">
                • {ex}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
