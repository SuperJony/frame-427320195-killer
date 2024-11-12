import { AllOptions } from "../types";
import { BaseNamingStrategy } from "./base-strategy";
import { InstanceState } from "./types";

export class InstanceNamingStrategy extends BaseNamingStrategy {
  private mainComponentCache = new Map<
    string,
    {
      mainComponent: ComponentNode | null;
      timestamp: number;
    }
  >();

  private readonly CACHE_DURATION = 5000; // 5 seconds

  canHandle(node: SceneNode): boolean {
    return node.type === "INSTANCE";
  }

  async generateName(node: SceneNode, options: AllOptions): Promise<string> {
    if (node.type !== "INSTANCE") throw new Error("Invalid node type");

    const state = await this.getInstanceState(node);
    return this.generateInstanceName(state, options);
  }

  private async getCachedMainComponent(
    node: InstanceNode
  ): Promise<ComponentNode | null> {
    const cacheKey = node.id;
    const now = Date.now();
    const cached = this.mainComponentCache.get(cacheKey);

    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.mainComponent;
    }

    const mainComponent = await node.getMainComponentAsync();
    this.mainComponentCache.set(cacheKey, {
      mainComponent,
      timestamp: now,
    });

    return mainComponent;
  }

  private async getInstanceState(node: InstanceNode): Promise<InstanceState> {
    const mainComponent = await this.getCachedMainComponent(node);

    return {
      hasOverrides: this.checkForOverrides(node),
      isNested: node.parent?.type === "INSTANCE",
      mainComponent,
      variantProperties: node.variantProperties,
    };
  }

  private checkForOverrides(node: InstanceNode): boolean {
    // 检查常见的覆盖属性
    return (
      node.overflowDirection !== "NONE" ||
      node.opacity !== 1 ||
      (node.effects as Effect[]).length > 0 ||
      (node.fills as Paint[]).length > 0
    );
  }

  private generateInstanceName(
    state: InstanceState,
    options: AllOptions
  ): string {
    const parts: string[] = [];

    // 基础名称
    if (state.mainComponent?.parent?.type === "COMPONENT_SET") {
      parts.push(state.mainComponent.parent.name);
    } else {
      parts.push(state.mainComponent?.name || "Instance");
    }

    // 添加变体信息
    if (
      state.variantProperties &&
      Object.keys(state.variantProperties).length > 0
    ) {
      const variants = Object.entries(state.variantProperties)
        .map(([key, value]) => `${key}=${value}`)
        .join(",");
      parts.push(`[${variants}]`);
    }

    // 添加状态标记
    if (state.hasOverrides) parts.push("(modified)");
    if (state.isNested) parts.push("(nested)");

    return this.formatName(parts.join("-"), options, true);
  }
}
