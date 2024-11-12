import { AllOptions } from "../types";
import { BaseNamingStrategy } from "./base-strategy";

export class ShapeNamingStrategy extends BaseNamingStrategy {
  canHandle(node: SceneNode): boolean {
    return node.type === "RECTANGLE" || node.type === "ELLIPSE";
  }

  async generateName(node: SceneNode, options: AllOptions): Promise<string> {
    if (node.type !== "RECTANGLE" && node.type !== "ELLIPSE") {
      throw new Error("Invalid node type");
    }

    const name = this.getNameBasedOnFill(node);
    return this.formatName(name, options);
  }

  private getNameBasedOnFill(node: RectangleNode | EllipseNode): string {
    if ("fills" in node) {
      const fills = node.fills as Paint[];
      const hasImage = fills.some((fill) => fill.type === "IMAGE");
      const hasVideo = fills.some((fill) => fill.type === "VIDEO");

      if (hasVideo) return "video";
      if (hasImage) return "image";
    }

    return node.type.toLowerCase();
  }
}
