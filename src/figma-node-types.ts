// 获取所有 Figma 节点类型
export type FigmaNodeType = SceneNode["type"];

// 创建一个包含所有 Figma 节点类型的数组
export const ALL_FIGMA_NODE_TYPES: FigmaNodeType[] = [
  "SLICE",
  "FRAME",
  "GROUP",
  "COMPONENT_SET",
  "COMPONENT",
  "INSTANCE",
  "BOOLEAN_OPERATION",
  "VECTOR",
  "STAR",
  "LINE",
  "ELLIPSE",
  "POLYGON",
  "RECTANGLE",
  "TEXT",
  "STICKY",
  "CONNECTOR",
  "SHAPE_WITH_TEXT",
  "CODE_BLOCK",
  "STAMP",
  "WIDGET",
  "EMBED",
  "LINK_UNFURL",
  "MEDIA",
  "SECTION",
  "HIGHLIGHT",
  "WASHI_TAPE",
  "TABLE",
];

// 布尔操作的特殊情况
const BOOLEAN_OPERATIONS = ["Union", "Intersect", "Subtract", "Exclude"];

// 添加缓存
const validNodeTypeCache = new Set<string>(ALL_FIGMA_NODE_TYPES);

/**
 * 验证节点类型是否为有效的 Figma 节点类型（带缓存）
 * @param type 要验证的节点类型
 * @returns 是否为有效的 Figma 节点类型
 */
export function isValidFigmaNodeType(type: string): type is FigmaNodeType {
  return validNodeTypeCache.has(type);
}

// const figmaNameRegex = new RegExp(
//   `^(${[...ALL_FIGMA_NODE_TYPES, ...BOOLEAN_OPERATIONS].join("|")})$`,
//   "i"
// );

export const figmaNameWithNumberRegex = /^\S+\s\d+$/;

// 修改 isFigmaGeneratedName 函数
export function isFigmaGeneratedName(node: SceneNode): boolean {
  // 检查是否是带数字的 Figma 默认命名
  if (figmaNameWithNumberRegex.test(node.name)) {
    return true;
  }

  // 将输入名称转换为小写进行比较
  const lowerName = node.name.toLowerCase();
  const lowerType = node.type.toLowerCase();

  // 检查名称是否与节点自身类型匹配
  if (lowerName === lowerType) {
    return true;
  }

  // 对于布尔操作，检查是否使用了布尔操作的名称
  if (node.type === "BOOLEAN_OPERATION") {
    return BOOLEAN_OPERATIONS.some(
      (operation) => operation.toLowerCase() === lowerName
    );
  }

  return false;
}
