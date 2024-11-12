import {
  emit,
  loadSettingsAsync,
  on,
  saveSettingsAsync,
  showUI,
} from "@create-figma-plugin/utilities";
import { isFigmaGeneratedName, isValidFigmaNodeType } from "./figma-node-types";
import { AllOptions } from "./types";
import {
  isComponentType,
  shouldProcessNode,
  toKebabCase,
  toPascalCase,
} from "./utilities";

// 定义插件生成的图层名称列表
const PLUGIN_GENERATED_NAMES = [
  "group",
  "frame",
  "grid",
  "row",
  "col",
  "video",
  "image",
  "boolean-union",
  "boolean-subtract",
  "boolean-intersect",
  "boolean-exclude",
];

// 创建插件生成的图层名称模式的正则表达式
const PLUGIN_NAME_PATTERN = new RegExp(
  `^(${PLUGIN_GENERATED_NAMES.join("|")})(-\\[\\d+(?:,\\s*\\d+)?\\])?$`
);

// 创建节点类型到名称的映射，用于快速查找
const nodeTypeNameMap = new Map<NodeType, string>([
  ["GROUP", "group"],
  ["TEXT", "text"],
  ["COMPONENT", "Component"],
  ["COMPONENT_SET", "ComponentSet"],
  ["RECTANGLE", "rectangle"],
  ["ELLIPSE", "ellipse"],
]);

//TODO mask group 无法重命名

/**
 * 重命名单个图层
 * @param node 要重命名的图层节点
 * @param options 重命名选项
 * @returns 如果图层被重命名则返回 Promise<boolean>
 */
async function renameLayer(
  node: SceneNode,
  options: AllOptions
): Promise<boolean> {
  // 根据选项跳过特定类型的图层
  if (node.locked && !options.locked) return false;
  if (node.visible === false && !options.hidden) return false;

  // 检查是否需要重命名用户自定义的图层名称
  if (!options.renameCustomNames && !isFigmaOrPluginGeneratedName(node)) {
    return false;
  }

  // 获取基础名称，如果在映射中找不到，则使用小写的节点类型
  let newName = nodeTypeNameMap.get(node.type) || node.type.toLowerCase();

  // 根据节点类型处理特殊情况
  if (node.type === "FRAME") {
    newName = getFrameName(node, options);
  } else if (node.type === "INSTANCE") {
    // 对于实例,使用其主组件或父组件集的名称
    const mainComponent = await node.getMainComponentAsync();
    if (
      mainComponent?.parent &&
      mainComponent.parent.type === "COMPONENT_SET"
    ) {
      newName = mainComponent.parent.name;
    } else {
      newName = mainComponent?.name || "Instance";
    }
  } else if (node.type === "BOOLEAN_OPERATION") {
    newName = `boolean-${node.booleanOperation.toLowerCase()}`;
  } else if (node.type === "RECTANGLE" || node.type === "ELLIPSE") {
    newName = getNameBasedOnFill(node);
  }

  // 修改最终命名逻辑
  let finalName = newName;
  if (!isComponentType(node.type)) {
    finalName = options.usePascalCase
      ? toPascalCase(newName)
      : toKebabCase(newName);
  }

  // 如果新名称与当前名称不同,则更新名称
  if (node.name !== finalName) {
    node.name = finalName;
    return true; // 返回 true 表示图层已被重命名
  }

  return false; // 返回 false 表示图层未被重命名
}

/* ---------------------------------------------------------------------------------------------- */

/**
 * 重命名选中的图层
 * @param options 重命名选项
 * @returns 是否有任何图层被重命名
 */
function renameLayersInSelection(options: AllOptions): Promise<boolean> {
  return new Promise(async (resolve) => {
    const selection = figma.currentPage.selection;
    let hasRenamed = false;
    let index = 0;

    async function processNextBatch() {
      const endIndex = Math.min(index + 100, selection.length);
      for (; index < endIndex; index++) {
        const node = selection[index];
        if (shouldProcessNode(node, options)) {
          hasRenamed =
            (await renameNodeAndChildren(node, options)) || hasRenamed;
        }
      }

      if (index < selection.length) {
        setTimeout(() => processNextBatch(), 0);
      } else {
        resolve(hasRenamed);
      }
    }

    await processNextBatch();
  });
}

/**
 * 递归函数，用于重命名节点及其子节点
 * @param node 要处理的节点
 * @param options 重命名选项
 * @returns 是否有任何节点被重命名
 */
async function renameNodeAndChildren(
  node: SceneNode,
  options: AllOptions
): Promise<boolean> {
  if (node.type === "INSTANCE" && !options.instance) return false;

  let hasRenamed = await renameLayer(node, options);

  if ("children" in node) {
    for (const child of node.children) {
      hasRenamed = (await renameNodeAndChildren(child, options)) || hasRenamed;
    }
  }

  return hasRenamed;
}

/* ---------------------------------------------------------------------------------------------- */

/**
 * 判断图层名称是否为 Figma 或插件自动生成的
 * @param name 图层名称
 * @param node 图层节点
 * @returns 是否为 Figma 或插件自动生成的名称
 */
function isFigmaOrPluginGeneratedName(node: SceneNode): boolean {
  const name = node.name;
  // 验证节点类型（使用缓存的验证函数）
  if (!isValidFigmaNodeType(node.type)) {
    console.warn(`未知的 Figma 节点类型: ${node.type}`);
    return false;
  }

  // 处理文本节点
  if (node.type === "TEXT") {
    return (node as TextNode).autoRename || name === "text";
  }

  // 组件类型的特殊处理
  if (node.type === "COMPONENT" || node.type === "COMPONENT_SET") {
    // 只有匹配 "[类型][数字]" 格式时才返回 true
    return /^\S+\s\d+$/.test(name);
  }

  // 其他类型的处理保持不变
  if (isFigmaGeneratedName(name)) {
    return true;
  }

  // 检查是否匹配插件生成的名称模式
  return PLUGIN_NAME_PATTERN.test(name);
}

/* ---------------------------------------------------------------------------------------------- */

/**
 * 获取 frame 名称
 * @param node 图层节点
 * @param options 重命名选项
 * @returns 新名称
 */
function getFrameName(node: FrameNode, options: AllOptions) {
  let newName = "";
  if ("layoutMode" in node) {
    // 根据布局模式确定名称
    if (node.layoutMode === "HORIZONTAL") {
      newName = node.layoutWrap === "WRAP" ? "grid" : "row";
    } else if (node.layoutMode === "VERTICAL") {
      newName = "col";
    }

    // 如果启用了显示间距选项,添加间距信息
    if (options.showSpacing) {
      if (newName === "grid") {
        if (node.itemSpacing === node.counterAxisSpacing) {
          newName += `-[${node.itemSpacing}]`;
        } else {
          newName += `-[${node.itemSpacing}, ${node.counterAxisSpacing}]`;
        }
      } else if (newName === "row" || newName === "col") {
        newName += `-[${node.itemSpacing}]`;
      }
    }
  }
  if (!newName) newName = "frame";

  return newName;
}

/* ---------------------------------------------------------------------------------------------- */

/**
 * 根据填充类型确定图层名称
 * @param node 图层节点
 * @returns 基于填充类型的名称
 */
function getNameBasedOnFill(node: RectangleNode | EllipseNode): string {
  if ("fills" in node) {
    const fills = node.fills as Paint[];
    const hasImage = fills.some((fill) => fill.type === "IMAGE");
    const hasVideo = fills.some((fill) => fill.type === "VIDEO");

    if (hasVideo) {
      return "video";
    } else if (hasImage) {
      return "image";
    }
  }

  return node.type.toLowerCase();
}

/* ---------------------------------------------------------------------------------------------- */

/**
 * 插件主函数
 */
export default async function () {
  // 设置 UI 窗口大小
  const uiOptions = {
    width: 240,
    height: 262,
  };

  // 加载保存的设置
  const savedOptions: AllOptions = await loadSettingsAsync(
    {
      locked: false,
      hidden: false,
      instance: false,
      showSpacing: false,
      renameCustomNames: false,
      usePascalCase: false,
    },
    "allOptions"
  );

  const data = {
    savedOptions: savedOptions,
    initialSelection: figma.currentPage.selection.length > 0,
  };

  // 显示 UI
  showUI(uiOptions, data);

  // 只在选中变化时发送事件
  figma.on("selectionchange", () => {
    emit("SELECTION_CHANGED", figma.currentPage.selection.length > 0);
  });

  // 监听 UI 发送的重命名事件
  on("SETTING_OPEN", (settingOpen: boolean) => {
    figma.ui.resize(240, settingOpen ? 262 : 408);
  });

  on("RENAME", (receivedOptions: AllOptions) => {
    // 根据用户选项设置 skipInvisibleInstanceChildren
    figma.skipInvisibleInstanceChildren =
      !receivedOptions.hidden && !receivedOptions.instance;

    // 保存用户的选项
    saveSettingsAsync(receivedOptions, "allOptions");

    // 执行重命名操作并处理结果
    renameLayersInSelection(receivedOptions).then((hasRenamed) => {
      if (hasRenamed) {
        figma.notify("🎉 重命名完成！");
      } else {
        figma.notify("😶‍🌫️ 没有图层需要重命名");
      }
    });
  });
}
