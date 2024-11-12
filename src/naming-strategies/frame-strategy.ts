import { AllOptions } from "../types";
import { BaseNamingStrategy } from "./base-strategy";

export class FrameNamingStrategy extends BaseNamingStrategy {
  canHandle(node: SceneNode): boolean {
    return node.type === "FRAME";
  }

  async generateName(node: SceneNode, options: AllOptions): Promise<string> {
    if (node.type !== "FRAME") throw new Error("Invalid node type");

    const name = this.getFrameName(node, options);
    return this.formatName(name, options);
  }

  private getFrameName(node: FrameNode, options: AllOptions): string {
    let name = "";

    if ("layoutMode" in node) {
      if (node.layoutMode === "HORIZONTAL") {
        name = node.layoutWrap === "WRAP" ? "grid" : "row";
      } else if (node.layoutMode === "VERTICAL") {
        name = "col";
      }

      if (options.showSpacing && node.layoutMode !== "NONE") {
        name = this.addSpacingInfo(name, node);
      }
    }

    return name || "frame";
  }

  private addSpacingInfo(name: string, node: FrameNode): string {
    if (name === "grid") {
      if (node.itemSpacing === node.counterAxisSpacing) {
        return `${name}-[${node.itemSpacing}]`;
      }
      return `${name}-[${node.itemSpacing},${node.counterAxisSpacing}]`;
    }

    if (name === "row" || name === "col") {
      return `${name}-[${node.itemSpacing}]`;
    }

    return name;
  }
}
