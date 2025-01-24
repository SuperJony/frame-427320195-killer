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
