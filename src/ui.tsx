import "!./output.css";
import {
  Button,
  Checkbox,
  Container,
  Disclosure,
  Divider,
  render,
  SegmentedControl,
  Stack,
  Text,
  VerticalSpace,
  type SegmentedControlOption,
} from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
import React from "preact/compat";
import { useEffect, useState } from "preact/hooks";
import { i18n } from "./i18n";
import { renameOptionsConfig, settingOptionsConfig } from "./options-config";
import { AllOptions, Language, RenameOptions, SettingOptions } from "./types";

// Plugin 组件: 插件的主要 UI 组件
function Plugin({
  savedOptions,
  initialSelection,
}: {
  savedOptions: AllOptions;
  initialSelection: boolean;
}) {
  const [renameOptions, setRenameOptions] = useState<RenameOptions>({
    instance: savedOptions.instance,
    locked: savedOptions.locked,
    hidden: savedOptions.hidden,
  });

  const [settingOptions, setSettingOptions] = useState<SettingOptions>({
    renameCustomNames: savedOptions.renameCustomNames,
    showSpacing: savedOptions.showSpacing,
    usePascalCase: savedOptions.usePascalCase,
    language: savedOptions.language || "en",
  });

  const [hasSelection, setHasSelection] = useState(initialSelection);

  const [settingOpen, setSettingOpen] = useState<boolean>(false);

  const [language, setLanguage] = useState<Language>(
    savedOptions.language || "en"
  );
  const t = i18n[language];

  // 语言切换选项
  const languageOptions: Array<SegmentedControlOption> = [
    {
      value: "en",
      children: "🇬🇧 EN",
    },
    {
      value: "zh",
      children: "🇨🇳 中文",
    },
  ];

  // 修改事件监听逻辑
  useEffect(() => {
    function handleSelectionChange(hasSelection: boolean) {
      setHasSelection(hasSelection);
    }

    on("SELECTION_CHANGED", handleSelectionChange);
  }, []);

  // 添加保存设置的函数
  const saveOptions = async (newOptions: Partial<AllOptions>) => {
    const updatedOptions = {
      ...renameOptions,
      ...settingOptions,
      ...newOptions,
    };
    emit("SAVE_SETTINGS", updatedOptions);
  };

  // 修改处理重命名选项变化的函数
  const handleRenameOptionChange = (optionName: keyof RenameOptions) => {
    const newOptions = {
      ...renameOptions,
      [optionName]: !renameOptions[optionName],
    };
    setRenameOptions(newOptions);
    saveOptions(newOptions);
  };

  // 修改处理设置选项变化的函数
  const handleSettingOptionChange = (optionName: keyof SettingOptions) => {
    const newOptions = {
      ...settingOptions,
      [optionName]: !settingOptions[optionName],
    };
    setSettingOptions(newOptions);
    saveOptions(newOptions);
  };

  // 修改处理语言切换的函数
  const handleLanguageChange = (event: { currentTarget: HTMLInputElement }) => {
    const newLanguage = event.currentTarget.value as Language;
    setLanguage(newLanguage);
    const newOptions = {
      ...settingOptions,
      language: newLanguage,
    };
    setSettingOptions(newOptions);
    saveOptions(newOptions);

    // 如果设置面板是打开的，更新窗口高度
    if (settingOpen) {
      emit("SETTING_OPEN", { settingOpen: true, language: newLanguage });
    }
  };

  // 处理重命名按钮点击事件的函数
  const handleRenameClick = () => {
    emit("RENAME", { ...renameOptions, ...settingOptions });
  };

  // 处理设置按钮点击事件的函数
  function handleSettingClick() {
    const newSettingOpen = !settingOpen;
    setSettingOpen(newSettingOpen);
    emit("SETTING_OPEN", {
      settingOpen: newSettingOpen,
      language: language,
    });
  }

  // 渲染 UI 组件
  return (
    <>
      <Container space="medium">
        <VerticalSpace space="large" />

        <Text>{t.renameTargetsLabel}</Text>

        <VerticalSpace space="large" />

        <Stack space="large">
          {/* 使用 map 生成其他重命名选项的复选框 */}
          {renameOptionsConfig.map((option) => (
            <Checkbox
              key={option.key}
              value={renameOptions[option.key]}
              onValueChange={() => handleRenameOptionChange(option.key)}
            >
              <Text>
                {option.emoji} {t.options[option.key].title}
              </Text>
              {t.options[option.key].description && (
                <>
                  <VerticalSpace space="small" />
                  <Text style={{ color: "#999" }}>
                    {t.options[option.key].description}
                  </Text>
                </>
              )}
            </Checkbox>
          ))}
        </Stack>

        <VerticalSpace space="large" />

        {/* 重命名按钮: 根据是否有选中图层决定是否禁用 */}
        <Button fullWidth onClick={handleRenameClick} disabled={!hasSelection}>
          {hasSelection ? t.renameLayerButton : t.selectLayerFirst}
        </Button>

        <VerticalSpace space="large" />
      </Container>

      <Divider />

      <VerticalSpace space="extraSmall" />

      <Disclosure
        onClick={handleSettingClick}
        open={settingOpen}
        title={t.settingsTitle}
      >
        <div className="flex flex-col gap-4">
          {settingOptionsConfig.map((option) => (
            <Checkbox
              key={option.key}
              value={settingOptions[option.key]}
              onValueChange={() => handleSettingOptionChange(option.key)}
            >
              <Text>
                {option.emoji} {t.options[option.key].title}
              </Text>
              {t.options[option.key].description && (
                <>
                  <VerticalSpace space="small" />
                  <Text style={{ color: "#999" }}>
                    {t.options[option.key].description}
                  </Text>
                </>
              )}
            </Checkbox>
          ))}
          <Divider />
          <div className="flex flex-row justify-between items-center w-[240px]">
            <Text>{t.languageLabel}</Text>
            <SegmentedControl
              options={languageOptions}
              onChange={handleLanguageChange}
              value={language}
            />
          </div>
        </div>
      </Disclosure>

      <VerticalSpace space="extraSmall" />
    </>
  );
}

// 导出渲染后的 Plugin 组件
export default render(Plugin);
