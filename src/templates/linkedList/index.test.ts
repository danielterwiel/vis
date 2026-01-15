import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { skeletonCodeSystem } from "../skeletonCodeSystem";
import { registerLinkedListTemplates, easySkeleton, mediumSkeleton, hardSkeleton } from "./index";

describe("LinkedList Templates", () => {
  beforeEach(() => {
    skeletonCodeSystem.clearTemplates();
    registerLinkedListTemplates();
  });

  afterEach(() => {
    skeletonCodeSystem.clearTemplates();
  });

  describe("Template Registration", () => {
    it("should register all three difficulty levels", () => {
      const templates = skeletonCodeSystem.getRegisteredTemplates();

      expect(templates).toContain("linkedlist-easy");
      expect(templates).toContain("linkedlist-medium");
      expect(templates).toContain("linkedlist-hard");
    });

    it("should retrieve easy template", () => {
      const template = skeletonCodeSystem.getSkeletonCode("linkedList", "easy");
      expect(template).toBe(easySkeleton);
      expect(template).toContain("findElement");
      expect(template).toContain("TODO: Implement find operation");
    });

    it("should retrieve medium template", () => {
      const template = skeletonCodeSystem.getSkeletonCode("linkedList", "medium");
      expect(template).toBe(mediumSkeleton);
      expect(template).toContain("reverseList");
      expect(template).toContain("TODO: Implement list reversal");
    });

    it("should retrieve hard template", () => {
      const template = skeletonCodeSystem.getSkeletonCode("linkedList", "hard");
      expect(template).toBe(hardSkeleton);
      expect(template).toContain("detectCycle");
      expect(template).toContain("TODO: Implement cycle detection");
    });
  });

  describe("Template Content", () => {
    it("easy template should have correct structure", () => {
      expect(easySkeleton).toContain("function findElement(list, target)");
      expect(easySkeleton).toContain("list.find(target)");
      expect(easySkeleton).toContain("TrackedLinkedList");
    });

    it("medium template should have correct structure", () => {
      expect(mediumSkeleton).toContain("function reverseList(list)");
      expect(mediumSkeleton).toContain("list.reverse()");
      expect(mediumSkeleton).toContain("list.toArray()");
    });

    it("hard template should have correct structure", () => {
      expect(hardSkeleton).toContain("function detectCycle(list)");
      expect(hardSkeleton).toContain("list.hasCycle()");
      expect(hardSkeleton).toContain("Floyd's algorithm");
    });
  });

  describe("TODO Extraction", () => {
    it("should extract TODOs from easy template", () => {
      const todos = skeletonCodeSystem.extractTodos(easySkeleton);
      expect(todos).toContain("Implement find operation");
    });

    it("should extract TODOs from medium template", () => {
      const todos = skeletonCodeSystem.extractTodos(mediumSkeleton);
      expect(todos).toContain("Implement list reversal");
    });

    it("should extract TODOs from hard template", () => {
      const todos = skeletonCodeSystem.extractTodos(hardSkeleton);
      expect(todos).toContain("Implement cycle detection");
    });
  });

  describe("Hint Extraction", () => {
    it("should extract hints from easy template", () => {
      const hints = skeletonCodeSystem.getInlineHints(easySkeleton);
      expect(hints).toContain("Use list.find(target) to search for the value");
    });

    it("should extract hints from medium template", () => {
      const hints = skeletonCodeSystem.getInlineHints(mediumSkeleton);
      expect(hints).toContain("Use list.reverse() to reverse the list in place");
    });

    it("should extract hints from hard template", () => {
      const hints = skeletonCodeSystem.getInlineHints(hardSkeleton);
      expect(hints).toContain("Use list.hasCycle() to detect cycles using Floyd's algorithm");
    });
  });
});
