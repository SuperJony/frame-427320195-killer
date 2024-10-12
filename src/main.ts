import {
  emit,
  loadSettingsAsync,
  on,
  saveSettingsAsync,
  showUI,
} from "@create-figma-plugin/utilities";
import { AllOptions } from "./types";
import {
  isComponentType,
  shouldProcessNode,
  toKebabCase,
  toPascalCase,
} from "./utilities";

// 定义 Figma 自动生成的图层名称模式
const FIGMA_NAME_PATTERN =
  /^(RECTANGLE|ELLIPSE|TEXT|FRAME|GROUP|COMPONENT|COMPONENT_SET|INSTANCE|BOOLEAN_OPERATION|Union|Intersect|Subtract|Exclude)(\s\d+)?$/i;

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

/**
 * 重命名单个图层
 * @param node 要重命名的图层节点
 * @param options 重命名选项
 * @returns 如果图层被重命名则返回 true,否则返回 false
 */
function renameLayer(node: SceneNode, options: AllOptions): boolean {
  // 根据选项跳过特定类型的图层
  if (node.locked && !options.locked) return false;
  if (node.visible === false && !options.hidden) return false;

  // 检查是否需要重命名用户自定义的图层名称
  if (
    !options.renameCustomNames &&
    !isFigmaOrPluginGeneratedName(node.name, node)
  ) {
    return false;
  }

  // 获取基础名称，如果在映射中找不到，则使用小写的节点类型
  let newName = nodeTypeNameMap.get(node.type) || node.type.toLowerCase();

  // 根据节点类型处理特殊情况
  if (node.type === "FRAME") {
    newName = getFrameName(node, options);
  } else if (node.type === "INSTANCE") {
    // 对于实例,使用其主组件或父组件集的名称
    if (
      node.mainComponent?.parent &&
      node.mainComponent.parent.type === "COMPONENT_SET"
    ) {
      newName = node.mainComponent.parent.name;
    } else {
      newName = node.mainComponent?.name || "Instance";
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
  return new Promise((resolve) => {
    const selection = figma.currentPage.selection;
    let hasRenamed = false;
    let index = 0;

    // 使用批处理来提高性能
    function processNextBatch() {
      const endIndex = Math.min(index + 100, selection.length);
      for (; index < endIndex; index++) {
        const node = selection[index];
        // 根据选项跳过不需要处理的节点
        if (shouldProcessNode(node, options)) {
          hasRenamed = renameNodeAndChildren(node, options) || hasRenamed;
        }
      }

      // 如果还有未处理的节点，安排下一批处理
      if (index < selection.length) {
        setTimeout(processNextBatch, 0);
      } else {
        resolve(hasRenamed);
      }
    }

    processNextBatch();
  });
}

/**
 * 递归函数，用于重命名节点及其子节点
 * @param node 要处理的节点
 * @param options 重命名选项
 * @returns 是否有任何节点被重命名
 */
function renameNodeAndChildren(node: SceneNode, options: AllOptions): boolean {
  // 如果是实例且不需要重命名实例,则直接返回
  if (node.type === "INSTANCE" && !options.instance) return false;

  let hasRenamed = renameLayer(node, options);

  // 如果选中的图层包含子集图层，则递归对内部的图层重命名
  if ("children" in node) {
    node.children.forEach((child) => {
      hasRenamed = renameNodeAndChildren(child, options) || hasRenamed;
    });
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
function isFigmaOrPluginGeneratedName(name: string, node: SceneNode): boolean {
  // 处理文本节点的特殊情况
  if (node.type === "TEXT") {
    const textNode = node as TextNode;
    return textNode.autoRename || name.toLowerCase() === "text";
  }

  // 处理布尔操作节点的特殊情况
  if (node.type === "BOOLEAN_OPERATION") {
    const booleanOperations = ["Union", "Intersect", "Subtract", "Exclude"];
    return booleanOperations.some((op) => name.startsWith(op));
  }

  // 检查名称是否匹配节点类型（可能带有数字后缀）
  const baseTypeName = node.type.charAt(0) + node.type.slice(1).toLowerCase();
  const namePattern = new RegExp(`^${baseTypeName}(\\s\\d+)?$`, "i");
  if (namePattern.test(name)) {
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
  };

  // 显示 UI
  showUI(uiOptions, data);

  // 初始化时发送选中状态
  emit("SELECTION_CHANGED", figma.currentPage.selection.length > 0);

  // 监听选中变化
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
