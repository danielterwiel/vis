import { useEffect, useRef } from "react";
import "./ConsoleOutput.css";

export interface ConsoleLog {
  level: "log" | "warn" | "error" | "info";
  args: unknown[];
  timestamp: number;
}

interface ConsoleOutputProps {
  logs: ConsoleLog[];
  onClear?: () => void;
}

export function ConsoleOutput({ logs, onClear }: ConsoleOutputProps) {
  const consoleRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const formatArg = (arg: unknown): string => {
    if (arg === null) return "null";
    if (arg === undefined) return "undefined";
    if (typeof arg === "string") return arg;
    if (typeof arg === "number" || typeof arg === "boolean") return String(arg);
    if (typeof arg === "function") return arg.toString();

    // Objects and arrays
    try {
      return JSON.stringify(arg, null, 2);
    } catch {
      return String(arg);
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ms = String(date.getMilliseconds()).padStart(3, "0");
    return `${hours}:${minutes}:${seconds}.${ms}`;
  };

  return (
    <div className="console-output">
      <div className="console-header">
        <h3>Console Output</h3>
        {logs.length > 0 && (
          <button className="console-clear-button" onClick={onClear} title="Clear console">
            Clear
          </button>
        )}
      </div>
      <div className="console-logs" ref={consoleRef}>
        {logs.length === 0 ? (
          <div className="console-empty">No console output yet</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={`console-log console-log-${log.level}`}>
              <span className="console-timestamp">{formatTimestamp(log.timestamp)}</span>
              <span className={`console-level console-level-${log.level}`}>
                {log.level.toUpperCase()}
              </span>
              <span className="console-message">{log.args.map(formatArg).join(" ")}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
