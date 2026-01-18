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
      expect(template).toContain("TODO: Traverse the list");
    });

    it("should retrieve medium template", () => {
      const template = skeletonCodeSystem.getSkeletonCode("linkedList", "medium");
      expect(template).toBe(mediumSkeleton);
      expect(template).toContain("reverseList");
      expect(template).toContain("TODO: Reverse the linked list");
    });

    it("should retrieve hard template", () => {
      const template = skeletonCodeSystem.getSkeletonCode("linkedList", "hard");
      expect(template).toBe(hardSkeleton);
      expect(template).toContain("detectCycle");
      expect(template).toContain("TODO: Implement Floyd's cycle detection");
    });
  });

  describe("Template Content", () => {
    it("easy template should have correct structure", () => {
      expect(easySkeleton).toContain("function findElement(list, target)");
      expect(easySkeleton).toContain("list.getHead()");
      expect(easySkeleton).toContain("node.value");
    });

    it("medium template should have correct structure", () => {
      expect(mediumSkeleton).toContain("function reverseList(list)");
      expect(mediumSkeleton).toContain("list.getHead()");
      expect(mediumSkeleton).toContain("list.toArray()");
    });

    it("hard template should have correct structure", () => {
      expect(hardSkeleton).toContain("function detectCycle(list)");
      expect(hardSkeleton).toContain("list.getHead()");
      expect(hardSkeleton).toContain("Floyd's");
    });
  });

  describe("TODO Extraction", () => {
    it("should extract TODOs from easy template", () => {
      const todos = skeletonCodeSystem.extractTodos(easySkeleton);
      expect(todos).toContain("Traverse the list and find the target value");
    });

    it("should extract TODOs from medium template", () => {
      const todos = skeletonCodeSystem.extractTodos(mediumSkeleton);
      expect(todos).toContain("Reverse the linked list by manipulating node pointers");
    });

    it("should extract TODOs from hard template", () => {
      const todos = skeletonCodeSystem.extractTodos(hardSkeleton);
      expect(todos).toContain("Implement Floyd's cycle detection algorithm");
    });
  });

  describe("Template Guidance", () => {
    it("easy template should guide node traversal", () => {
      expect(easySkeleton).toContain("node.next");
      expect(easySkeleton).toContain("Loop through the list");
    });

    it("medium template should guide pointer manipulation", () => {
      expect(mediumSkeleton).toContain("prev");
      expect(mediumSkeleton).toContain("current");
      expect(mediumSkeleton).toContain("current.next = prev");
    });

    it("hard template should guide two-pointer technique", () => {
      expect(hardSkeleton).toContain("slow");
      expect(hardSkeleton).toContain("fast");
      expect(hardSkeleton).toContain("slow === fast");
    });
  });
});
