import { AllOptions } from "../types";
import { BaseNamingStrategy } from "./base-strategy";

export class BooleanOperationStrategy extends BaseNamingStrategy {
  canHandle(node: SceneNode): boolean {
    return node.type === "BOOLEAN_OPERATION";
  }

  async generateName(node: SceneNode, options: AllOptions): Promise<string> {
    if (node.type !== "BOOLEAN_OPERATION") throw new Error("Invalid node type");

    const operationType = node.booleanOperation.toLowerCase();
    return this.formatName(operationType, options);
  }
}
