/**
 * Template system barrel export
 */

export * from "./types";
export * from "./skeletonCodeSystem";
export { registerArrayTemplates } from "./array";

// Register all templates on import
import { registerArrayTemplates } from "./array";

// Auto-register array templates
registerArrayTemplates();
