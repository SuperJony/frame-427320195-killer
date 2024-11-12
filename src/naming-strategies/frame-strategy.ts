import { AllOptions } from "../types";
import { BaseNamingStrategy } from "./base-strategy";

/**
 * Frame 类型枚举
 */
enum FrameType {
  FRAME = "frame",
  GRID = "grid",
  ROW = "row",
  COL = "col",
}

/**
 * Frame 布局类型
 */
type LayoutMode = "NONE" | "HORIZONTAL" | "VERTICAL";

/**
 * Frame 命名策略类
 */
export class FrameNamingStrategy extends BaseNamingStrategy {
  /**
   * 检查是否可以处理该节点
   */
  canHandle(node: SceneNode): boolean {
    return node.type === "FRAME";
  }

  /**
   * 生成节点名称
   */
  async generateName(node: SceneNode, options: AllOptions): Promise<string> {
    if (node.type !== "FRAME") {
      throw new Error("Invalid node type: expected FRAME");
    }

    const name = this.getFrameName(node, options);
    return this.formatName(name, options);
  }

  /**
   * 获取 Frame 的名称
   */
  private getFrameName(node: FrameNode, options: AllOptions): string {
    // 如果不是自动布局，直接返回基础 frame 名称
    if (!this.hasLayoutMode(node)) {
      return this.formatName(FrameType.FRAME, options);
    }

    // 获取基础名称
    const baseName = this.getBaseFrameName(node);

    // 格式化名称
    const formattedName = this.formatName(baseName, options);

    // 如果需要显示间距信息且有布局模式，添加间距
    return options.showSpacing && node.layoutMode !== "NONE"
      ? this.addSpacingInfo(formattedName, node)
      : formattedName;
  }

  /**
   * 检查节点是否具有布局模式
   */
  private hasLayoutMode(
    node: SceneNode
  ): node is FrameNode & { layoutMode: LayoutMode } {
    return "layoutMode" in node;
  }

  /**
   * 获取基础 Frame 名称
   */
  private getBaseFrameName(node: FrameNode): FrameType {
    if (node.layoutMode === "HORIZONTAL") {
      return node.layoutWrap === "WRAP" ? FrameType.GRID : FrameType.ROW;
    }

    if (node.layoutMode === "VERTICAL") {
      return FrameType.COL;
    }

    return FrameType.FRAME;
  }

  /**
   * 添加间距信息到名称中
   */
  private addSpacingInfo(name: string, node: FrameNode): string {
    const normalizedName = name.toLowerCase();

    if (this.isGridLayout(normalizedName)) {
      return this.addGridSpacing(name, node);
    }

    if (this.isAxisLayout(normalizedName)) {
      return this.addAxisSpacing(name, node);
    }

    return name;
  }

  /**
   * 检查是否为网格布局
   */
  private isGridLayout(name: string): boolean {
    return name === FrameType.GRID.toLowerCase();
  }

  /**
   * 检查是否为轴向布局（行或列）
   */
  private isAxisLayout(name: string): boolean {
    return [FrameType.ROW.toLowerCase(), FrameType.COL.toLowerCase()].includes(
      name
    );
  }

  /**
   * 添加网格布局的间距信息
   */
  private addGridSpacing(name: string, node: FrameNode): string {
    return node.itemSpacing === node.counterAxisSpacing
      ? `${name}-[${node.itemSpacing}]`
      : `${name}-[${node.itemSpacing},${node.counterAxisSpacing}]`;
  }

  /**
   * 添加轴向布局的间距信息
   */
  private addAxisSpacing(name: string, node: FrameNode): string {
    return `${name}-[${node.itemSpacing}]`;
  }
}
