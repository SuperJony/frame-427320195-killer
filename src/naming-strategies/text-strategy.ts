import { AllOptions } from "../types";
import { BaseNamingStrategy } from "./base-strategy";

export class TextStrategy extends BaseNamingStrategy {
  canHandle(node: SceneNode): boolean {
    return node.type === "TEXT";
  }

  async generateName(node: SceneNode, options: AllOptions): Promise<string> {
    return this.formatName("text", options);
  }
}
