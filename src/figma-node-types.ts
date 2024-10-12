// 获取所有 Figma 节点类型
export type FigmaNodeType = SceneNode["type"];

// 创建一个包含所有 Figma 节点类型的数组
export const ALL_FIGMA_NODE_TYPES: FigmaNodeType[] = [
  "RECTANGLE",
  "ELLIPSE",
  "POLYGON",
  "STAR",
  "VECTOR",
  "TEXT",
  "FRAME",
  "COMPONENT",
  "COMPONENT_SET",
  "INSTANCE",
  "BOOLEAN_OPERATION",
  "GROUP",
  "SLICE",
  "STAMP",
  "STICKY",
  "SHAPE_WITH_TEXT",
  "CONNECTOR",
  "SECTION",
  "HIGHLIGHT",
  "WASHI_TAPE",
  "TABLE",
  "CODE_BLOCK",
  "WIDGET",
  "EMBED",
  "LINK_UNFURL",
  "MEDIA",
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

// 优化 isFigmaGeneratedName 函数
const figmaNameRegex = new RegExp(
  `^(${[...ALL_FIGMA_NODE_TYPES, ...BOOLEAN_OPERATIONS].join("|")})$`,
  "i"
);
const figmaNameWithNumberRegex = /^\S+\s\d+$/;

export function isFigmaGeneratedName(name: string): boolean {
  return figmaNameRegex.test(name) || figmaNameWithNumberRegex.test(name);
}
