interface AnimationSpeedControlProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  disabled?: boolean;
}

export function AnimationSpeedControl({
  speed,
  onSpeedChange,
  disabled = false,
}: AnimationSpeedControlProps) {
  const speeds = [
    { value: 0.25, label: "0.25×" },
    { value: 0.5, label: "0.5×" },
    { value: 1, label: "1×" },
    { value: 1.5, label: "1.5×" },
    { value: 2, label: "2×" },
  ];

  return (
    <div className="animation-speed-control">
      <label htmlFor="animation-speed-slider" className="speed-label">
        Speed:
      </label>
      <div className="speed-buttons">
        {speeds.map((s) => (
          <button
            key={s.value}
            onClick={() => onSpeedChange(s.value)}
            disabled={disabled}
            className={`speed-button ${speed === s.value ? "active" : ""}`}
            title={`${s.label} speed`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
