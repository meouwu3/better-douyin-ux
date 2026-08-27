# 贡献指南

欢迎 PR。请尽量保持改动小、可测、不引入选项页。

## 流程

1. Fork / 开分支，基于 `main`。
2. `pnpm install && pnpm test && pnpm compile && pnpm build`
3. 若动到直播/视频 DOM，请在真实页面用开发者工具重新抓一份夹具，更新 `test/fixtures.ts` 和 `docs/douyin-dom.md`。
4. 提交信息按功能点拆分，例如 `feat: hide gift comments by DOM shape`。
5. 打开 Pull Request，附上测试输出或截图。

## 加屏蔽词

编辑 [`utils/keywords.ts`](utils/keywords.ts) 的 `BLOCKED_KEYWORDS`，并补一条 `test/storage.test.ts` / `test/chat.test.ts` 用例。不要加 popup 开关。

## 代码约定

- 业务判断写成纯函数，content script 只负责挂观察器。
- 优先稳定特征（`data-e2e`、`webcast-chatroom___*`、文案），少绑哈希 class。
- 测试必须调用真正导出的入口（`applyChatFilters`、`applyHighestQuality`、`ensureLiveSettings` 等），夹具用线上抓到的 HTML。
