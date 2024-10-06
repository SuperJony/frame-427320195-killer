export interface RenameOptions {
  instance: boolean;
  locked: boolean;
  hidden: boolean;
}

export interface SettingOptions {
  renameCustomNames: boolean;
  showSpacing: boolean;
  usePascalCase: boolean;
}

export interface AllOptions extends RenameOptions, SettingOptions {}
