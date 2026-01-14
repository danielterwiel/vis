import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  saveUserCode,
  loadUserCode,
  saveHintsRevealed,
  loadHintsRevealed,
  clearTestProgress,
  clearAllProgress,
} from "./localStorage";
import type { DataStructureType, DifficultyLevel } from "../../store/useAppStore";

describe("localStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("saveUserCode / loadUserCode", () => {
    it("should save and load user code", () => {
      const code = "function test() { return 42; }";
      saveUserCode("array", "easy", code);

      const loaded = loadUserCode("array", "easy");
      expect(loaded).toBe(code);
    });

    it("should return null for non-existent code", () => {
      const loaded = loadUserCode("array", "medium");
      expect(loaded).toBeNull();
    });

    it("should handle different data structures and difficulties separately", () => {
      saveUserCode("array", "easy", "array easy code");
      saveUserCode("array", "medium", "array medium code");
      saveUserCode("linkedList", "easy", "linkedList easy code");

      expect(loadUserCode("array", "easy")).toBe("array easy code");
      expect(loadUserCode("array", "medium")).toBe("array medium code");
      expect(loadUserCode("linkedList", "easy")).toBe("linkedList easy code");
    });

    it("should handle empty code", () => {
      saveUserCode("stack", "hard", "");
      expect(loadUserCode("stack", "hard")).toBe("");
    });

    it("should handle Unicode characters", () => {
      const code = "// 你好 emoji: 🚀";
      saveUserCode("tree", "easy", code);
      expect(loadUserCode("tree", "easy")).toBe(code);
    });
  });

  describe("saveHintsRevealed / loadHintsRevealed", () => {
    it("should save and load hints revealed count", () => {
      saveHintsRevealed("array", "easy", 2);
      expect(loadHintsRevealed("array", "easy")).toBe(2);

      saveHintsRevealed("array", "easy", 0);
      expect(loadHintsRevealed("array", "easy")).toBe(0);
    });

    it("should return null for non-existent hints", () => {
      expect(loadHintsRevealed("queue", "medium")).toBeNull();
    });

    it("should handle different data structures and difficulties separately", () => {
      saveHintsRevealed("array", "easy", 1);
      saveHintsRevealed("array", "medium", 2);
      saveHintsRevealed("graph", "hard", 3);

      expect(loadHintsRevealed("array", "easy")).toBe(1);
      expect(loadHintsRevealed("array", "medium")).toBe(2);
      expect(loadHintsRevealed("graph", "hard")).toBe(3);
    });

    it("should return null for invalid hints count", () => {
      localStorage.setItem("vis_app_v1_hints_array_easy", "invalid");
      expect(loadHintsRevealed("array", "easy")).toBeNull();
    });

    it("should return null for negative hints count", () => {
      localStorage.setItem("vis_app_v1_hints_array_easy", "-1");
      expect(loadHintsRevealed("array", "easy")).toBeNull();
    });
  });

  describe("clearTestProgress", () => {
    it("should clear code and hints for specific test", () => {
      saveUserCode("array", "easy", "test code");
      saveHintsRevealed("array", "easy", 2);
      saveUserCode("array", "medium", "other code");

      clearTestProgress("array", "easy");

      expect(loadUserCode("array", "easy")).toBeNull();
      expect(loadHintsRevealed("array", "easy")).toBeNull();
      expect(loadUserCode("array", "medium")).toBe("other code");
    });
  });

  describe("clearAllProgress", () => {
    it("should clear all stored data", () => {
      saveUserCode("array", "easy", "code1");
      saveUserCode("linkedList", "medium", "code2");
      saveHintsRevealed("tree", "hard", 3);

      clearAllProgress();

      expect(loadUserCode("array", "easy")).toBeNull();
      expect(loadUserCode("linkedList", "medium")).toBeNull();
      expect(loadHintsRevealed("tree", "hard")).toBeNull();
    });

    it("should not affect non-app localStorage keys", () => {
      localStorage.setItem("other_app_key", "other value");
      saveUserCode("array", "easy", "code");

      clearAllProgress();

      expect(localStorage.getItem("other_app_key")).toBe("other value");
      expect(loadUserCode("array", "easy")).toBeNull();
    });
  });

  describe("localStorage unavailable", () => {
    let setItemSpy: ReturnType<typeof vi.spyOn>;
    let getItemSpy: ReturnType<typeof vi.spyOn>;
    let removeItemSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      // Mock localStorage to throw errors
      setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
      getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("SecurityError");
      });
      removeItemSpy = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
        throw new Error("SecurityError");
      });
    });

    afterEach(() => {
      // Restore original localStorage functionality
      setItemSpy.mockRestore();
      getItemSpy.mockRestore();
      removeItemSpy.mockRestore();
    });

    it("should fail silently when saving user code", () => {
      expect(() => saveUserCode("array", "easy", "code")).not.toThrow();
    });

    it("should return null when loading user code", () => {
      expect(loadUserCode("array", "easy")).toBeNull();
    });

    it("should fail silently when clearing progress", () => {
      expect(() => clearTestProgress("array", "easy")).not.toThrow();
      expect(() => clearAllProgress()).not.toThrow();
    });
  });

  describe("all data structures and difficulties", () => {
    const dataStructures: DataStructureType[] = [
      "array",
      "linkedList",
      "stack",
      "queue",
      "tree",
      "graph",
      "hashMap",
    ];
    const difficulties: DifficultyLevel[] = ["easy", "medium", "hard"];

    it("should handle all combinations", () => {
      for (const ds of dataStructures) {
        for (const diff of difficulties) {
          const code = `${ds}_${diff}_code`;
          saveUserCode(ds, diff, code);
          expect(loadUserCode(ds, diff)).toBe(code);

          saveHintsRevealed(ds, diff, 1);
          expect(loadHintsRevealed(ds, diff)).toBe(1);
        }
      }
    });
  });
});
