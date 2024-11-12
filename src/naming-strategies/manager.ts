import { AllOptions } from "../types";
import { BooleanOperationStrategy } from "./boolean-strategy";
import { FrameNamingStrategy } from "./frame-strategy";
import { InstanceNamingStrategy } from "./instance-strategy";
import { ShapeNamingStrategy } from "./shape-strategy";
import { TextStrategy } from "./text-strategy";
import { NamingStrategy } from "./types";

export class NamingStrategyManager {
  private strategies: NamingStrategy[] = [];

  constructor() {
    this.registerDefaultStrategies();
  }

  private registerDefaultStrategies(): void {
    this.strategies = [
      new InstanceNamingStrategy(),
      new FrameNamingStrategy(),
      new ShapeNamingStrategy(),
      new BooleanOperationStrategy(),
      new TextStrategy(),
    ];
  }

  registerStrategy(strategy: NamingStrategy): void {
    this.strategies.push(strategy);
  }

  async generateName(node: SceneNode, options: AllOptions): Promise<string> {
    try {
      const strategy = this.strategies.find((s) => s.canHandle(node));
      if (!strategy) {
        return node.type.toLowerCase();
      }
      return await strategy.generateName(node, options);
    } catch (error) {
      console.error(`Error generating name for node ${node.id}:`, error);
      return node.type.toLowerCase();
    }
  }
}
