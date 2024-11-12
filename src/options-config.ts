import { RenameOptions, SettingOptions } from "./types";

interface OptionConfig<T> {
  key: keyof T;
  emoji: string;
  title: string;
  description?: string;
}

export const settingOptionsConfig: OptionConfig<SettingOptions>[] = [
  {
    key: "renameCustomNames",
    emoji: "🛁",
    title: "大扫除模式",
    description:
      "启用此选项将重命名用户自定义的图层名称。禁用时，仅重命名 Figma 和插件自动生成的图层名称",
  },
  {
    key: "showSpacing",
    emoji: "📏",
    title: "显示间距",
    // description: "启用此选项将在图层名称后显示 Auto Layout 的间距",
  },
  {
    key: "usePascalCase",
    emoji: "🐫",
    title: "使用大驼峰命名",
    // description: "启用此选项将使用大驼峰命名",
  },
];

export const renameOptionsConfig: OptionConfig<RenameOptions>[] = [
  {
    key: "locked",
    emoji: "🔒",
    title: "锁定图层",
  },
  {
    key: "hidden",
    emoji: "👻",
    title: "隐藏图层",
  },
  {
    key: "instance",
    emoji: "🧩",
    title: "实例图层",
    // description: "启用此选项将恢复实例默认名称，并重命名内部图层",
  },
];
