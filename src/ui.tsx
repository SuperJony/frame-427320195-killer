import {
  Button,
  Checkbox,
  Container,
  Divider,
  render,
  Stack,
  Text,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
import React from "preact/compat";
import { useEffect, useState } from "preact/hooks";
import { AllOptions, RenameOptions, SettingOptions } from "./types";

// Plugin 组件: 插件的主要 UI 组件
function Plugin({ savedOptions }: { savedOptions: AllOptions }) {
  // 状态管理: 使用 useState 钩子管理重命名选项和设置选项
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
  const [hasSelection, setHasSelection] = useState(false);

  // 副作用: 监听选择变化事件
  useEffect(() => {
    on("SELECTION_CHANGED", (hasSelection: boolean) => {
      setHasSelection(hasSelection);
    });
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

  // 渲染 UI 组件
  return (
    <>
      <Container space="medium">
        <VerticalSpace space="large" />

        <Text>重命名范围设置 :</Text>

        <VerticalSpace space="large" />

        <Stack space="large">
          {/* 重命名选项复选框 */}
          <Checkbox value={true} disabled>
            <Text>🖼️ 默认图层</Text>
          </Checkbox>

          <Checkbox
            value={renameOptions.locked}
            onValueChange={() => handleRenameOptionChange("locked")}
          >
            <Text>🔒 锁定图层</Text>
          </Checkbox>

          <Checkbox
            value={renameOptions.hidden}
            onValueChange={() => handleRenameOptionChange("hidden")}
          >
            <Text>👻 隐藏图层</Text>
          </Checkbox>

          <Checkbox
            value={renameOptions.instance}
            onValueChange={() => handleRenameOptionChange("instance")}
          >
            <Text>🧩 组件实例</Text>
            <VerticalSpace space="small" />
            <Text style={{ color: "#999" }}>
              启用此选项将恢复实例默认名称，并重命名内部图层
            </Text>
          </Checkbox>
        </Stack>

        <VerticalSpace space="large" />

        {/* 重命名按钮: 根据是否有选中图层决定是否禁用 */}
        <Button fullWidth onClick={handleRenameClick} disabled={!hasSelection}>
          {hasSelection ? "重命名图层" : "请先选择图层"}
        </Button>

        <VerticalSpace space="large" />
      </Container>

      <Divider />

      <Container space="medium">
        <VerticalSpace space="medium" />

        <Stack space="large">
          {/* 设置选项复选框 */}
          <Checkbox
            value={settingOptions.renameCustomNames}
            onValueChange={() => handleSettingOptionChange("renameCustomNames")}
          >
            <Text>🛁 大扫除模式</Text>
            <VerticalSpace space="small" />
            <Text style={{ color: "#999" }}>
              启用此选项将重命名用户自定义的图层名称。禁用时，仅重命名 Figma
              和插件自动生成的图层名称
            </Text>
          </Checkbox>

          <Checkbox
            value={settingOptions.showSpacing}
            onValueChange={() => handleSettingOptionChange("showSpacing")}
          >
            <Text>📏 显示间距</Text>
            <VerticalSpace space="small" />
            <Text style={{ color: "#999" }}>
              启用此选项将在图层名称后显示 Auto Layout 的间距
            </Text>
          </Checkbox>

          <Checkbox
            value={settingOptions.usePascalCase}
            onValueChange={() => handleSettingOptionChange("usePascalCase")}
          >
            <Text>🐫 使用大驼峰命名</Text>
            <VerticalSpace space="small" />
            <Text style={{ color: "#999" }}>默认命名方式为 kebab-case</Text>
          </Checkbox>
        </Stack>

        <VerticalSpace space="medium" />
      </Container>
    </>
  );
}

// 导出渲染后的 Plugin 组件
export default render(Plugin);
