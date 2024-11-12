import { AllOptions } from "../types";
import { BooleanOperationStrategy } from "./boolean-strategy";
import { FallbackStrategy } from "./fallback-strategy";
import { FrameNamingStrategy } from "./frame-strategy";
import { InstanceNamingStrategy } from "./instance-strategy";
import { BasicShapeStrategy } from "./shape-basic-strategy";
import { ShapeNamingStrategy } from "./shape-strategy";
import { TextStrategy } from "./text-strategy";
import { NamingStrategy } from "./types";

export class NamingStrategyManager {
  private strategies: NamingStrategy[] = [];
  private fallbackStrategy: NamingStrategy;

  constructor() {
    this.registerDefaultStrategies();
    this.fallbackStrategy = new FallbackStrategy();
  }

  private registerDefaultStrategies(): void {
    this.strategies = [
      new InstanceNamingStrategy(),
      new FrameNamingStrategy(),
      new ShapeNamingStrategy(),
      new BooleanOperationStrategy(),
      new TextStrategy(),
      new BasicShapeStrategy(),
    ];
  }

  registerStrategy(strategy: NamingStrategy): void {
    this.strategies.push(strategy);
  }

  async generateName(node: SceneNode, options: AllOptions): Promise<string> {
    try {
      const strategy = this.strategies.find((s) => s.canHandle(node));
      return await (strategy || this.fallbackStrategy).generateName(
        node,
        options
      );
    } catch (error) {
      console.error(`Error generating name for node ${node.id}:`, error);
      return this.fallbackStrategy.generateName(node, options);
    }
  }
}
