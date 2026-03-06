import type { Mode } from "../types";

type TabsProps = {
  value: Mode;
  onValueChange: (value: Mode) => void;
};

const MODES: Array<{ id: Mode; label: string }> = [
  { id: "upcoming", label: "Upcoming" },
  { id: "archived", label: "Archived" }
];

export function Tabs({ value, onValueChange }: TabsProps) {
  return (
    <div className="tabs" role="tablist" aria-label="Events mode">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          className={`tab ${value === mode.id ? "tab-active" : ""}`}
          role="tab"
          aria-selected={value === mode.id}
          onClick={() => onValueChange(mode.id)}
          type="button"
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
