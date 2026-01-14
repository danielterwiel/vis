import { useMemo } from "react";
import type { VisualizationStep } from "../../store/useAppStore";
import "./PerformanceMetrics.css";

export interface PerformanceMetricsProps {
  executionTime?: number;
  steps: VisualizationStep[];
  operationCount?: number;
  dataSize?: number;
}

interface ComplexityInfo {
  time: string;
  space: string;
  timeClass: "constant" | "logarithmic" | "linear" | "linearithmic" | "quadratic" | "exponential";
  spaceClass: "constant" | "logarithmic" | "linear" | "linearithmic" | "quadratic" | "exponential";
}

/**
 * Analyzes execution metrics to estimate algorithmic complexity
 * This is a heuristic estimation based on operation count vs data size
 */
function estimateComplexity(operationCount: number, dataSize: number): ComplexityInfo {
  if (dataSize === 0) {
    return {
      time: "O(1)",
      space: "O(1)",
      timeClass: "constant",
      spaceClass: "constant",
    };
  }

  const ratio = operationCount / dataSize;

  // Time complexity estimation
  let timeComplexity = "O(1)";
  let timeClass: ComplexityInfo["timeClass"] = "constant";

  if (ratio < 2) {
    timeComplexity = "O(1)";
    timeClass = "constant";
  } else if (ratio < Math.log2(dataSize) * 2) {
    timeComplexity = "O(log n)";
    timeClass = "logarithmic";
  } else if (ratio < dataSize * 1.5) {
    timeComplexity = "O(n)";
    timeClass = "linear";
  } else if (ratio < dataSize * Math.log2(dataSize) * 1.5) {
    timeComplexity = "O(n log n)";
    timeClass = "linearithmic";
  } else if (ratio < dataSize * dataSize * 1.5) {
    timeComplexity = "O(n²)";
    timeClass = "quadratic";
  } else {
    timeComplexity = "O(2ⁿ)";
    timeClass = "exponential";
  }

  // Space complexity: estimate based on max stack depth and auxiliary structures
  // For now, we'll estimate based on the operation types
  let spaceComplexity = "O(1)";
  let spaceClass: ComplexityInfo["spaceClass"] = "constant";

  // Simple heuristic: if we see recursive operations or many intermediate structures
  const hasRecursion = false; // TODO: detect from steps
  const auxiliarySpace = 0; // TODO: track from instrumentation

  if (hasRecursion || auxiliarySpace > dataSize) {
    spaceComplexity = "O(n)";
    spaceClass = "linear";
  } else if (auxiliarySpace > Math.log2(dataSize)) {
    spaceComplexity = "O(log n)";
    spaceClass = "logarithmic";
  } else {
    spaceComplexity = "O(1)";
    spaceClass = "constant";
  }

  return {
    time: timeComplexity,
    space: spaceComplexity,
    timeClass,
    spaceClass,
  };
}

export function PerformanceMetrics({
  executionTime = 0,
  steps,
  operationCount,
  dataSize = 0,
}: PerformanceMetricsProps) {
  const metrics = useMemo(() => {
    const ops = operationCount ?? steps.length;
    const complexity = estimateComplexity(ops, dataSize);

    return {
      executionTime,
      operationCount: ops,
      dataSize,
      complexity,
    };
  }, [executionTime, steps, operationCount, dataSize]);

  const formatTime = (ms: number): string => {
    if (ms < 1) return "<1ms";
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getComplexityColor = (
    complexityClass: ComplexityInfo["timeClass"] | ComplexityInfo["spaceClass"],
  ): string => {
    switch (complexityClass) {
      case "constant":
        return "excellent";
      case "logarithmic":
        return "good";
      case "linear":
        return "fair";
      case "linearithmic":
        return "fair";
      case "quadratic":
        return "poor";
      case "exponential":
        return "bad";
      default:
        return "neutral";
    }
  };

  return (
    <div className="performance-metrics">
      <div className="metrics-header">
        <h4>Performance Metrics</h4>
      </div>

      <div className="metrics-grid">
        <div className="metric-item">
          <span className="metric-label">Execution Time</span>
          <span className="metric-value time">{formatTime(metrics.executionTime)}</span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Operations</span>
          <span className="metric-value operations">{metrics.operationCount}</span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Data Size</span>
          <span className="metric-value data-size">{metrics.dataSize}</span>
        </div>

        <div className="metric-item complexity-item">
          <span className="metric-label">Time Complexity</span>
          <span
            className={`metric-value complexity ${getComplexityColor(metrics.complexity.timeClass)}`}
          >
            {metrics.complexity.time}
          </span>
        </div>

        <div className="metric-item complexity-item">
          <span className="metric-label">Space Complexity</span>
          <span
            className={`metric-value complexity ${getComplexityColor(metrics.complexity.spaceClass)}`}
          >
            {metrics.complexity.space}
          </span>
        </div>
      </div>

      <div className="complexity-guide">
        <div className="guide-item">
          <span className="guide-color excellent"></span>
          <span className="guide-label">O(1)</span>
        </div>
        <div className="guide-item">
          <span className="guide-color good"></span>
          <span className="guide-label">O(log n)</span>
        </div>
        <div className="guide-item">
          <span className="guide-color fair"></span>
          <span className="guide-label">O(n) / O(n log n)</span>
        </div>
        <div className="guide-item">
          <span className="guide-color poor"></span>
          <span className="guide-label">O(n²)</span>
        </div>
        <div className="guide-item">
          <span className="guide-color bad"></span>
          <span className="guide-label">O(2ⁿ)</span>
        </div>
      </div>
    </div>
  );
}
