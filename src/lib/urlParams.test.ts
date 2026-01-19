import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getUrlParams,
  updateUrlParams,
  isValidDataStructure,
  isValidDifficulty,
} from "./urlParams";
import type { DataStructureType, DifficultyLevel } from "../store/useAppStore";

describe("urlParams", () => {
  beforeEach(() => {
    // Reset URL to a clean state before each test
    window.history.replaceState(null, "", "/");
  });

  describe("getUrlParams", () => {
    it("returns null values when no URL params are present", () => {
      const params = getUrlParams();
      expect(params.dataStructure).toBeNull();
      expect(params.difficulty).toBeNull();
    });

    it("returns data structure from URL params", () => {
      window.history.replaceState(null, "", "/?ds=linkedList");
      const params = getUrlParams();
      expect(params.dataStructure).toBe("linkedList");
    });

    it("returns difficulty from URL params", () => {
      window.history.replaceState(null, "", "/?difficulty=hard");
      const params = getUrlParams();
      expect(params.difficulty).toBe("hard");
    });

    it("returns both data structure and difficulty from URL params", () => {
      window.history.replaceState(null, "", "/?ds=tree&difficulty=medium");
      const params = getUrlParams();
      expect(params.dataStructure).toBe("tree");
      expect(params.difficulty).toBe("medium");
    });

    it("normalizes binaryTree alias to tree", () => {
      window.history.replaceState(null, "", "/?ds=binaryTree");
      const params = getUrlParams();
      expect(params.dataStructure).toBe("tree");
    });

    it("normalizes binaryTree alias with difficulty", () => {
      window.history.replaceState(null, "", "/?ds=binaryTree&difficulty=hard");
      const params = getUrlParams();
      expect(params.dataStructure).toBe("tree");
      expect(params.difficulty).toBe("hard");
    });
  });

  describe("updateUrlParams", () => {
    it("updates URL with data structure and difficulty", () => {
      updateUrlParams("array" as DataStructureType, "easy" as DifficultyLevel);
      expect(window.location.search).toBe("?ds=array&difficulty=easy");
    });

    it("updates URL parameters without page reload", () => {
      const spy = vi.spyOn(window.history, "replaceState");
      updateUrlParams("linkedList" as DataStructureType, "hard" as DifficultyLevel);

      expect(spy).toHaveBeenCalledWith(
        null,
        "",
        expect.stringContaining("ds=linkedList&difficulty=hard"),
      );
    });

    it("overwrites existing parameters", () => {
      window.history.replaceState(null, "", "/?ds=array&difficulty=easy");
      updateUrlParams("graph" as DataStructureType, "medium" as DifficultyLevel);

      expect(window.location.search).toBe("?ds=graph&difficulty=medium");
    });

    it("preserves URL pathname", () => {
      window.history.replaceState(null, "", "/somepath?ds=array");
      updateUrlParams("tree" as DataStructureType, "easy" as DifficultyLevel);

      expect(window.location.pathname).toBe("/somepath");
      expect(window.location.search).toBe("?ds=tree&difficulty=easy");
    });
  });

  describe("isValidDataStructure", () => {
    it("returns true for valid data structure types", () => {
      expect(isValidDataStructure("array")).toBe(true);
      expect(isValidDataStructure("linkedList")).toBe(true);
      expect(isValidDataStructure("stack")).toBe(true);
      expect(isValidDataStructure("queue")).toBe(true);
      expect(isValidDataStructure("tree")).toBe(true);
      expect(isValidDataStructure("graph")).toBe(true);
      expect(isValidDataStructure("hashMap")).toBe(true);
    });

    it("returns false for invalid data structure types", () => {
      expect(isValidDataStructure("invalid")).toBe(false);
      expect(isValidDataStructure("Array")).toBe(false);
      expect(isValidDataStructure("")).toBe(false);
      expect(isValidDataStructure(null)).toBe(false);
    });
  });

  describe("isValidDifficulty", () => {
    it("returns true for valid difficulty levels", () => {
      expect(isValidDifficulty("easy")).toBe(true);
      expect(isValidDifficulty("medium")).toBe(true);
      expect(isValidDifficulty("hard")).toBe(true);
    });

    it("returns false for invalid difficulty levels", () => {
      expect(isValidDifficulty("invalid")).toBe(false);
      expect(isValidDifficulty("Easy")).toBe(false);
      expect(isValidDifficulty("")).toBe(false);
      expect(isValidDifficulty(null)).toBe(false);
    });
  });
});
