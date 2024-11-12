import { AllOptions } from "../types";

export interface NamingStrategy {
  canHandle(node: SceneNode): boolean;
  generateName(node: SceneNode, options: AllOptions): Promise<string>;
}

export interface InstanceState {
  hasOverrides: boolean;
  isNested: boolean;
  mainComponent: ComponentNode | null;
  variantProperties: Record<string, string> | null;
}
