import {
  Button,
  Checkbox,
  Container,
  Disclosure,
  Divider,
  render,
  Stack,
  Text,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
import React from "preact/compat";
import { useEffect, useState } from "preact/hooks";
import { renameOptionsConfig, settingOptionsConfig } from "./options-config";
import { AllOptions, RenameOptions, SettingOptions } from "./types";

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
  });

  const [hasSelection, setHasSelection] = useState(initialSelection);

  const [settingOpen, setSettingOpen] = useState<boolean>(false);

  // 修改事件监听逻辑
  useEffect(() => {
    function handleSelectionChange(hasSelection: boolean) {
      setHasSelection(hasSelection);
    }

    on("SELECTION_CHANGED", handleSelectionChange);
  }, []);

  // 处理重命名选项变化的函数
  const handleRenameOptionChange = (optionName: keyof RenameOptions) => {
    setRenameOptions((prevOptions) => ({
      ...prevOptions,
      [optionName]: !prevOptions[optionName],
    }));
  };

  // 处理设置选项变化的函数
  const handleSettingOptionChange = (optionName: keyof SettingOptions) => {
    setSettingOptions((prevOptions) => ({
      ...prevOptions,
      [optionName]: !prevOptions[optionName],
    }));
  };

  // 处理重命名按钮点击事件的函数
  const handleRenameClick = () => {
    emit("RENAME", { ...renameOptions, ...settingOptions });
  };

  // 处理设置按钮点击事件的函数
  function handleSettingClick() {
    setSettingOpen(!settingOpen);
    emit("SETTING_OPEN", settingOpen);
  }

  // 渲染 UI 组件
  return (
    <>
      <Container space="medium">
        <VerticalSpace space="large" />

        <Text>除了基础图层以外，对以下图层也进行重命名 :</Text>

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
                {option.emoji} {option.title}
              </Text>
              {option.description && (
                <>
                  <VerticalSpace space="small" />
                  <Text style={{ color: "#999" }}>{option.description}</Text>
                </>
              )}
            </Checkbox>
          ))}
        </Stack>

        <VerticalSpace space="large" />

        {/* 重命名按钮: 根据是否有选中图层决定是否禁用 */}
        <Button fullWidth onClick={handleRenameClick} disabled={!hasSelection}>
          {hasSelection ? "重命名图层" : "请先选择图层"}
        </Button>

        <VerticalSpace space="large" />
      </Container>

      <Divider />

      <VerticalSpace space="extraSmall" />

      <Disclosure
        onClick={handleSettingClick}
        open={settingOpen}
        title="🛠️ 设置"
      >
        <Stack space="large">
          {settingOptionsConfig.map((option) => (
            <Checkbox
              key={option.key}
              value={settingOptions[option.key]}
              onValueChange={() => handleSettingOptionChange(option.key)}
            >
              <Text>
                {option.emoji} {option.title}
              </Text>
              {option.description && (
                <>
                  <VerticalSpace space="small" />
                  <Text style={{ color: "#999" }}>{option.description}</Text>
                </>
              )}
            </Checkbox>
          ))}
        </Stack>
      </Disclosure>

      <VerticalSpace space="extraSmall" />
    </>
  );
}

// 导出渲染后的 Plugin 组件
export default render(Plugin);
