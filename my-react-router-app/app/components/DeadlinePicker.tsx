import { useState } from "react";

interface DeadlinePickerProps {
  onDeadlineSet: (date: Date) => void;
}

export function DeadlinePicker({ onDeadlineSet }: DeadlinePickerProps) {
  const [deadline, setDeadline] = useState<string>("");
  const [time, setTime] = useState<string>("12:00");

  const handleConfirm = () => {
    if (deadline) {
      const [year, month, day] = deadline.split("-");
      const [hours, minutes] = time.split(":");
      const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
      onDeadlineSet(date);
    }
  };

  const isValid = deadline && new Date(`${deadline}T${time}`) > new Date();

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white text-lg">When does betting lock?</h3>
      <p className="text-white/70 text-sm">Set the deadline for joining/switching sides</p>

      <div className="space-y-3">
        <div>
          <label className="block text-white/70 text-sm mb-2">Date</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
          />
        </div>

        <div>
          <label className="block text-white/70 text-sm mb-2">Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
          />
        </div>
      </div>

      {deadline && (
        <div className="bg-white/10 border border-white/20 rounded-lg p-3">
          <p className="text-white/70 text-sm">Deadline:</p>
          <p className="text-white font-medium">
            {new Date(`${deadline}T${time}`).toLocaleString()}
          </p>
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={!isValid}
        className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
          isValid
            ? "bg-green-500 text-white hover:bg-green-600"
            : "bg-white/10 text-white/50 cursor-not-allowed"
        }`}
      >
        Set Deadline
      </button>
    </div>
  );
}
