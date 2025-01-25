export type OptionKey =
  | "instance"
  | "locked"
  | "hidden"
  | "renameCustomNames"
  | "showSpacing"
  | "usePascalCase";

// 定义重命名选项的键
export type RenameOptionKey = "instance" | "locked" | "hidden";
// 定义设置选项的键
export type SettingOptionKey =
  | "renameCustomNames"
  | "showSpacing"
  | "usePascalCase";

// 使用普通接口而不是映射类型
export interface RenameOptions {
  instance: boolean;
  locked: boolean;
  hidden: boolean;
}

export type Language = "en" | "zh";

export interface SettingOptions {
  renameCustomNames: boolean;
  showSpacing: boolean;
  usePascalCase: boolean;
  language: Language;
}

export interface AllOptions extends RenameOptions, SettingOptions {}
