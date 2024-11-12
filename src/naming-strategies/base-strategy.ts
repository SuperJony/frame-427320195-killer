import { AllOptions } from "../types";
import { toCamelCase, toPascalCase } from "../utilities";
import { NamingStrategy } from "./types";

/**
 * 基础命名策略抽象类
 * 实现了 NamingStrategy 接口，为所有具体命名策略提供基础功能
 * 包含通用的名称格式化逻辑，同时定义了必须由子类实现的抽象方法
 */
export abstract class BaseNamingStrategy implements NamingStrategy {
  /**
   * 判断该策略是否可以处理指定的节点
   * @param node - Figma 场景节点
   * @returns 如果策略可以处理该节点则返回 true
   */
  abstract canHandle(node: SceneNode): boolean;

  /**
   * 格式化节点名称的辅助方法
   * @param name - 原始名称
   * @param options - 全局配置选项
   * @param preserveCase - 是否保留原始大小写（默认为 false）
   * @returns 格式化后的名称
   *
   * 处理逻辑：
   * 1. 如果 preserveCase 为 true，直接返回原始名称
   * 2. 将名称按 "-" 分割，分离基础名称和附加信息
   * 3. 根据 usePascalCase 选项将基础名称转换为 Pascal 或 Camel 命名
   * 4. 如果存在附加信息，将其重新用 "-" 连接到基础名称后
   */
  protected formatName(
    name: string,
    options: AllOptions,
    preserveCase: boolean = false
  ): string {
    if (preserveCase) return name;

    const [baseName, ...additionalInfo] = name.split("-");
    const normalizedBaseName = baseName.toLowerCase();

    const formattedBaseName = options.usePascalCase
      ? toPascalCase(normalizedBaseName)
      : toCamelCase(normalizedBaseName);

    return additionalInfo.length > 0
      ? `${formattedBaseName}-${additionalInfo.join("-")}`
      : formattedBaseName;
  }

  /**
   * 生成节点名称的抽象方法
   * @param node - Figma 场景节点
   * @param options - 全局配置选项
   * @returns Promise<string> 生成的名称
   */
  abstract generateName(node: SceneNode, options: AllOptions): Promise<string>;
}
