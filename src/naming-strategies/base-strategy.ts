import { AllOptions } from "../types";
import { NamingStrategy } from "./types";

export abstract class BaseNamingStrategy implements NamingStrategy {
  abstract canHandle(node: SceneNode): boolean;

  protected formatName(
    name: string,
    options: AllOptions,
    preserveCase: boolean = false
  ): string {
    if (preserveCase) return name;

    if (options.usePascalCase) {
      return this.toPascalCase(name);
    }
    return this.toKebabCase(name);
  }

  private toPascalCase(str: string): string {
    return str
      .split(/[-_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase();
  }

  abstract generateName(node: SceneNode, options: AllOptions): Promise<string>;
}
