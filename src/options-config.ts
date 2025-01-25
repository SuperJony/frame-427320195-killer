import { OptionKey, RenameOptionKey, SettingOptionKey } from "./types";

interface OptionConfig {
  key: OptionKey;
  emoji: string;
}

export const renameOptionsConfig: Array<
  OptionConfig & { key: RenameOptionKey }
> = [
  {
    key: "locked",
    emoji: "🔒",
  },
  {
    key: "hidden",
    emoji: "👻",
  },
  {
    key: "instance",
    emoji: "🔄",
  },
];

export const settingOptionsConfig: Array<
  OptionConfig & { key: SettingOptionKey }
> = [
  {
    key: "renameCustomNames",
    emoji: "🛁",
  },
  {
    key: "showSpacing",
    emoji: "📏",
  },
  {
    key: "usePascalCase",
    emoji: "🐫",
  },
];
