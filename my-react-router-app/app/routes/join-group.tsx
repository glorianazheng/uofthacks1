import { useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/join-group";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Join a Group" },
    { name: "description", content: "Join an existing group" },
  ];
}

const EMOJI_OPTIONS = ["😀", "😎", "🥳", "🤔", "😴", "🤯", "😍", "🚀", "⚡", "🔥", "💎", "🎮", "🎬", "🍕", "🐱"];

export default function JoinGroup() {
  const [step, setStep] = useState<"name-emoji" | "code">("name-emoji");
  const [name, setName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("😀");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleNameSubmit = () => {
    if (name.trim()) {
      setStep("code");
    }
  };

  const handleCodeSubmit = () => {
    if (code.length === 6) {
      // TODO: Validate code with backend
      console.log("Joining group with code:", code, "as", name, selectedEmoji);
      alert("Joining group... (feature coming soon)");
      // navigate("/dashboard");
    } else {
      setError("Code must be 6 characters");
    }
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
          <h1 className="text-3xl font-bold text-white">Join a Group</h1>
        </div>

        {/* Content */}
        <div className="bg-gradient-to-b from-green-500/10 to-teal-500/10 border border-white/20 rounded-2xl p-6">
          {step === "name-emoji" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-white text-lg">Quick intro</h3>

              <div>
                <label className="block text-white/70 text-sm mb-2">Your name</label>
                <input
                  type="text"
                  placeholder="e.g., Jay, Eva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-3">Pick your emoji</label>
                <div className="grid grid-cols-5 gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`p-3 rounded-lg text-2xl border-2 transition-all ${
                        selectedEmoji === emoji
                          ? "border-green-400 bg-green-400/20"
                          : "border-white/20 bg-white/10 hover:border-white/40"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleNameSubmit}
                disabled={!name.trim()}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
                  name.trim()
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-white/10 text-white/50 cursor-not-allowed"
                }`}
              >
                Continue
              </button>
            </div>
          )}

          {step === "code" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-white text-lg">Enter invite code</h3>
              <p className="text-white/70 text-sm">Ask your host for a 6-character code</p>

              <div>
                <p className="text-white/70 text-sm mb-2">You are: {selectedEmoji} {name}</p>
                <input
                  type="text"
                  placeholder="ABC123"
                  value={code.toUpperCase()}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase().slice(0, 6));
                    setError("");
                  }}
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 font-mono text-2xl text-center tracking-widest"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                onClick={handleCodeSubmit}
                disabled={code.length !== 6}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
                  code.length === 6
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-white/10 text-white/50 cursor-not-allowed"
                }`}
              >
                Join Group
              </button>

              <button
                onClick={() => setStep("name-emoji")}
                className="w-full px-4 py-2 rounded-lg text-white/70 hover:text-white transition-all"
              >
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
