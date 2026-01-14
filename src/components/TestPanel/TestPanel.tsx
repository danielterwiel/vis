import { useState, type ReactElement } from "react";
import { IconCheck, IconX, IconCircle, IconPlayerPlay } from "@tabler/icons-react";
import type { TestCase, TestResult } from "../../lib/testing/types";
import useAppStore from "../../store/useAppStore";
import "./TestPanel.css";

interface TestPanelProps {
  testCases: TestCase[];
  onRunTest: (testCase: TestCase) => Promise<void>;
  onRunAllTests: () => Promise<void>;
}

export function TestPanel({ testCases, onRunTest, onRunAllTests }: TestPanelProps) {
  const [isRunning, setIsRunning] = useState(false);
  const testResults = useAppStore((state) => state.testResults);

  const handleRunTest = async (testCase: TestCase) => {
    setIsRunning(true);
    try {
      await onRunTest(testCase);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunAll = async () => {
    setIsRunning(true);
    try {
      await onRunAllTests();
    } finally {
      setIsRunning(false);
    }
  };

  const getTestResult = (testId: string): TestResult | undefined => {
    return testResults.get(testId);
  };

  const getStatusIcon = (testId: string): ReactElement => {
    const result = getTestResult(testId);
    if (!result) return <IconCircle size={18} />;
    return result.passed ? <IconCheck size={18} /> : <IconX size={18} />;
  };

  const getStatusClass = (testId: string): string => {
    const result = getTestResult(testId);
    if (!result) return "not-run";
    return result.passed ? "passed" : "failed";
  };

  const passedCount = Array.from(testResults.values()).filter((r) => r.passed).length;
  const totalRun = testResults.size;

  return (
    <div className="test-panel">
      <div className="test-panel-header">
        <h3>Test Cases</h3>
        <div className="test-summary">
          {totalRun > 0 && (
            <span className={passedCount === totalRun ? "all-passed" : "some-failed"}>
              {passedCount}/{totalRun} passed
            </span>
          )}
        </div>
      </div>

      <div className="test-actions">
        <button
          onClick={handleRunAll}
          disabled={isRunning || testCases.length === 0}
          aria-label="Run all tests"
        >
          <IconPlayerPlay size={18} />
          {isRunning ? "Running..." : "Run All Tests"}
        </button>
      </div>

      <div className="test-list">
        {testCases.length === 0 ? (
          <div className="no-tests">No tests available</div>
        ) : (
          testCases.map((testCase) => {
            const result = getTestResult(testCase.id);
            return (
              <div key={testCase.id} className={`test-item ${getStatusClass(testCase.id)}`}>
                <div className="test-item-header">
                  <span className="test-status">{getStatusIcon(testCase.id)}</span>
                  <span className="test-name">{testCase.name}</span>
                  <span className={`test-difficulty ${testCase.difficulty}`}>
                    {testCase.difficulty}
                  </span>
                </div>

                <div className="test-description">{testCase.description}</div>

                {result && (
                  <div className="test-result-details">
                    {result.passed ? (
                      <div className="test-success">
                        <span>Passed in {result.executionTime}ms</span>
                        {result.steps.length > 0 && (
                          <span className="step-count">
                            {result.steps.length} operations captured
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="test-error">
                        <div className="error-message">{result.error}</div>
                        {result.executionTime > 0 && (
                          <div className="execution-time">
                            Failed after {result.executionTime}ms
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="test-item-actions">
                  <button
                    className="run-single-test"
                    onClick={() => handleRunTest(testCase)}
                    disabled={isRunning}
                    aria-label={`Run ${testCase.name}`}
                  >
                    <IconPlayerPlay size={16} />
                    {isRunning ? "Running..." : "Run"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
