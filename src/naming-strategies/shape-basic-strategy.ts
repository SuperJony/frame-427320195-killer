import { AllOptions } from "../types";
import { BaseNamingStrategy } from "./base-strategy";

export class BasicShapeStrategy extends BaseNamingStrategy {
  canHandle(node: SceneNode): boolean {
    return [
      "LINE",
      "POLYGON",
      "STAR",
      "VECTOR",
      "STICKY",
      "CONNECTOR",
      "SHAPE_WITH_TEXT",
      "STAMP",
      "HIGHLIGHT",
      "WASHI_TAPE",
    ].includes(node.type);
  }

  async generateName(node: SceneNode, options: AllOptions): Promise<string> {
    return this.formatName(node.type.toLowerCase(), options);
  }
}
