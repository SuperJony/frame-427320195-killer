import type { AllOptions } from "./types";

function isComponentType(type: string): boolean {
  return ["COMPONENT", "COMPONENT_SET", "INSTANCE"].includes(type);
}

/**
 * 将字符串转换为 PascalCase
 * @param str 输入字符串
 * @returns PascalCase 格式的字符串
 */
function toPascalCase(str: string): string {
  // 处理空字符串或非字符串输入
  if (!str || typeof str !== "string") return "";

  return (
    str
      // 处理所有可能的分隔符（连字符、下划线、空格）
      .split(/[-_\s]+/)
      // 过滤掉空字符串
      .filter((word) => word.length > 0)
      // 转换每个单词
      .map((word) => {
        // 处理全大写的缩写词
        if (word === word.toUpperCase()) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join("")
  );
}

/**
 * 将字符串转换为 camelCase
 * @param str 输入字符串
 * @returns camelCase 格式的字符串
 */
function toCamelCase(str: string): string {
  // 处理空字符串或非字符串输入
  if (!str || typeof str !== "string") return "";

  const pascal = toPascalCase(str);
  // 处理空字符串的情况
  if (!pascal) return "";

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
