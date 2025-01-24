import { RenameOptions, SettingOptions } from "./types";

type RenameOptionConfig = {
  key: keyof RenameOptions;
  emoji: string;
};

type SettingOptionConfig = {
  key: Exclude<keyof SettingOptions, "language">; // Exclude language from settings options
  emoji: string;
};

export const renameOptionsConfig: RenameOptionConfig[] = [
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

export const settingOptionsConfig: SettingOptionConfig[] = [
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
