import { describe, it, expect, beforeAll } from "vitest";
import { skeletonCodeSystem } from "../index"; // Import from main index to trigger auto-registration

/**
 * Integration test to verify linkedList templates are automatically registered
 * This simulates what happens when the app imports from src/templates/index.ts
 */
describe("LinkedList Template Integration", () => {
  beforeAll(() => {
    // Templates are auto-registered when ../index is imported above
  });

  it("should have linkedList easy template registered on app startup", () => {
    expect(() => {
      skeletonCodeSystem.getSkeletonCode("linkedList", "easy");
    }).not.toThrow();

    const template = skeletonCodeSystem.getSkeletonCode("linkedList", "easy");
    expect(template).toContain("findElement");
  });

  it("should have linkedList medium template registered on app startup", () => {
    expect(() => {
      skeletonCodeSystem.getSkeletonCode("linkedList", "medium");
    }).not.toThrow();

    const template = skeletonCodeSystem.getSkeletonCode("linkedList", "medium");
    expect(template).toContain("reverseList");
  });

  it("should have linkedList hard template registered on app startup", () => {
    expect(() => {
      skeletonCodeSystem.getSkeletonCode("linkedList", "hard");
    }).not.toThrow();

    const template = skeletonCodeSystem.getSkeletonCode("linkedList", "hard");
    expect(template).toContain("detectCycle");
  });

  it("should support case-insensitive lookup (linkedList vs linkedlist)", () => {
    // The getKey method converts to lowercase, so both should work
    const template1 = skeletonCodeSystem.getSkeletonCode("linkedList", "easy");
    const template2 = skeletonCodeSystem.getSkeletonCode("linkedlist", "easy");
    expect(template1).toBe(template2);
  });
});
