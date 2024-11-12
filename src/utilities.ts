import type { AllOptions } from "./types";

function isComponentType(type: string): boolean {
  return ["COMPONENT", "COMPONENT_SET", "INSTANCE"].includes(type);
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function shouldProcessNode(node: SceneNode, options: AllOptions): boolean {
  if (!options.locked && node.locked) return false;
  if (!options.hidden && node.visible === false) return false;
  if (!options.instance && node.type === "INSTANCE") return false;
  return true;
}

export {
  isComponentType,
  shouldProcessNode,
  toCamelCase,
  toKebabCase,
  toPascalCase,
};
