import { AllOptions } from "../types";
import { BaseNamingStrategy } from "./base-strategy";

/**
 * 兜底命名策略类
 * 用于处理所有其他策略都无法处理的节点类型
 */
export class FallbackStrategy extends BaseNamingStrategy {
  /**
   * 始终返回 true，表示可以处理任何类型的节点
   */
  canHandle(node: SceneNode): boolean {
    return true;
  }

  /**
   * 为未被其他策略处理的节点生成基础名称
   * @param node - Figma 场景节点
   * @param options - 命名配置选项
   */
  async generateName(node: SceneNode, options: AllOptions): Promise<string> {
    return this.formatName(node.type, options);
  }
}
