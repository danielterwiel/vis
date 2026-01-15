/**
 * Template system barrel export
 */

export * from "./types";
export * from "./skeletonCodeSystem";
export { registerArrayTemplates } from "./array";
export { registerLinkedListTemplates } from "./linkedList";
export { registerStackTemplates } from "./stack";
export { registerQueueTemplates } from "./queue";
export { registerBinaryTreeTemplates } from "./binaryTree";
export { registerGraphTemplates } from "./graph";
export { registerHashMapTemplates } from "./hashMap";

// Register all templates on import
import { registerArrayTemplates } from "./array";
import { registerLinkedListTemplates } from "./linkedList";
import { registerStackTemplates } from "./stack";
import { registerQueueTemplates } from "./queue";
import { registerBinaryTreeTemplates } from "./binaryTree";
import { registerGraphTemplates } from "./graph";
import { registerHashMapTemplates } from "./hashMap";

// Auto-register templates
registerArrayTemplates();
registerLinkedListTemplates();
registerStackTemplates();
registerQueueTemplates();
registerBinaryTreeTemplates();
registerGraphTemplates();
registerHashMapTemplates();
