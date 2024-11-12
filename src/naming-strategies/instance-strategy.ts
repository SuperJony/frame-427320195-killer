import { AllOptions } from "../types";
import { BaseNamingStrategy } from "./base-strategy";
import { InstanceState } from "./types";

/**
 * 实例命名策略类
 * 专门处理 Figma 实例节点的命名逻辑
 * 继承自 BaseNamingStrategy，实现了实例特定的命名规则
 */
export class InstanceNamingStrategy extends BaseNamingStrategy {
  /**
   * 缓存主组件信息，用于优化性能
   * key: 实例节点ID
   * value: {
   *   mainComponent: 主组件引用
   *   timestamp: 缓存时间戳
   * }
   */
  private mainComponentCache = new Map<
    string,
    {
      mainComponent: ComponentNode | null;
      timestamp: number;
    }
  >();

  // 缓存有效期为5秒，避免频繁请求主组件
  private readonly CACHE_DURATION = 5000;

  /**
   * 检查是否可以处理给定节点
   * @param node - Figma 场景节点
   * @returns 仅当节点类型为 INSTANCE 时返回 true
   */
  canHandle(node: SceneNode): boolean {
    return node.type === "INSTANCE";
  }

  /**
   * 为实例节点生成名称
   * @param node - 实例节点
   * @param options - 命名配置选项
   * @throws 如果节点类型不是 INSTANCE
   */
  async generateName(node: SceneNode, options: AllOptions): Promise<string> {
    if (node.type !== "INSTANCE") throw new Error("Invalid node type");

    const state = await this.getInstanceState(node);
    return this.generateInstanceName(state, options);
  }

  /**
   * 获取或更新主组件的缓存
   * 使用缓存机制避免频繁调用 getMainComponentAsync
   * @param node - 实例节点
   * @returns 主组件或 null（如果未找到）
   */
  private async getCachedMainComponent(
    node: InstanceNode
  ): Promise<ComponentNode | null> {
    const cacheKey = node.id;
    const now = Date.now();
    const cached = this.mainComponentCache.get(cacheKey);

    // 如果缓存存在且未过期，直接返回缓存的主组件
    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.mainComponent;
    }

    // 缓存不存在或已过期，重新获取并更新缓存
    const mainComponent = await node.getMainComponentAsync();
    this.mainComponentCache.set(cacheKey, {
      mainComponent,
      timestamp: now,
    });

    return mainComponent;
  }

  /**
   * 收集实例节点的状态信息
   * @param node - 实例节点
   * @returns 包含实例状态的对象
   */
  private async getInstanceState(node: InstanceNode): Promise<InstanceState> {
    const mainComponent = await this.getCachedMainComponent(node);

    return {
      hasOverrides: this.checkForOverrides(node),
      isNested: node.parent?.type === "INSTANCE", // 检查是否为嵌套实例
      mainComponent,
      variantProperties: node.variantProperties,
    };
  }

  /**
   * 检查实例是否包含覆盖属性
   * 检查常见的可能被覆盖的属性：溢出方向、透明度、效果和填充
   * @param node - 实例节点
   * @returns 如果存在任何覆盖则返回 true
   */
  private checkForOverrides(node: InstanceNode): boolean {
    return (
      node.overflowDirection !== "NONE" ||
      node.opacity !== 1 ||
      (node.effects as Effect[]).length > 0 ||
      (node.fills as Paint[]).length > 0
    );
  }

  /**
   * 根据实例状态生成最终的名称
   * 命名规则：
   * 1. 基础名称：使用组件集名称或单个组件名称
   * 2. 变体信息：如果存在，添加 [key=value] 格式的变体属性
   * 3. 状态标记：添加 (modified) 或 (nested) 等状态标识
   *
   * @param state - 实例状态信息
   * @param options - 命名配置选项
   * @returns 格式化后的实例名称
   */
  private generateInstanceName(
    state: InstanceState,
    options: AllOptions
  ): string {
    const parts: string[] = [];

    // 确定基础名称：优先使用组件集名称
    if (state.mainComponent?.parent?.type === "COMPONENT_SET") {
      parts.push(state.mainComponent.parent.name);
    } else {
      parts.push(state.mainComponent?.name || "Instance");
    }

    // 添加变体属性信息，限制字符数量
    if (
      state.variantProperties &&
      Object.keys(state.variantProperties).length > 0
    ) {
      const MAX_VARIANT_LENGTH = 50; // 设置变体信息的最大字符数
      const variants = Object.entries(state.variantProperties)
        .map(([key, value]) => `${key}=${value}`)
        .join(",");

      // 如果变体信息超过最大长度，进行截断
      const truncatedVariants =
        variants.length > MAX_VARIANT_LENGTH
          ? variants.substring(0, MAX_VARIANT_LENGTH) + "..."
          : variants;

      parts.push(`[${truncatedVariants}]`);
    }

    // 添加状态标记
    if (state.hasOverrides) parts.push("(modified)");
    if (state.isNested) parts.push("(nested)");

    // 使用基础策略的格式化方法处理最终名称
    return this.formatName(parts.join("-"), options, true);
  }
}
