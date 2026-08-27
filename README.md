# Better Douyin UX

<img src="public/icon/128.png" width="64" height="64" alt="Better Douyin UX" />

面向网页版抖音的浏览器扩展。抖音网页端不会记住「屏蔽礼物特效 / 关闭送礼信息 / 最高画质」这类选择，这个扩展每次进入页面都会替你重新校验并补上。

> 非官方项目，与字节跳动 / 抖音无关。

## 功能

### 直播（`live.douyin.com/*`、`www.douyin.com/**/live/*`）

1. **自动关闭送礼信息、福袋口令，开启屏蔽礼物特效**  
   进房时悬停一次弹幕 / 礼物设置并拨到目标状态；成功后不再反复展开面板，只在开关已挂在 DOM 里时静默复查。MAIN world 同时改写 `danmakuConfig` / `DanmaSetting_GiftAndPackage`。
2. **评论区屏蔽送礼信息**  
   优先用结构识别：`送出了` 后紧跟礼物 `<img>` 和 `×N`  combo，以及 `.webcast-chatroom__room-message` 里的「为主播加了 n 分」。关键字只作兜底。
3. **屏蔽关键字「伯哥」**  
   写死在 [`utils/keywords.ts`](utils/keywords.ts)，没有选项页。评论走 DOM 隐藏；弹幕是 `CanvasDanmakuPlugin`，在 MAIN world 拦截 `fillText` / `strokeText`。
4. **去掉昵称前的徽章**  
   等级、消费勋章、粉丝团等名字前面的元素一律隐藏，包括「加入了直播间」进房条和输入框上方的来了 / 点赞提示。

### 视频（非直播）

5. **自动最高画质**  
   读取 `.xgplayer-playclarity-setting` 菜单，跳过「智能 / 自动」和需要登录的档位，点击当前最高可用项。信息流切视频后会再执行一次。

## 安装

### 从源码

```bash
pnpm install
pnpm build
```

Chrome / Edge：打开 `chrome://extensions` → 打开开发者模式 → 「加载已解压的扩展程序」→ 选择 `.output/chrome-mv3`。

Firefox：

```bash
pnpm build:firefox
```

加载 `.output/firefox-mv3`（或 `pnpm zip:firefox` 得到的 zip）。

开发时用 `pnpm dev`，WXT 会起一个带热更新的 Chromium。

## 开发

```bash
pnpm install
pnpm dev          # Chromium
pnpm test         # vitest + jsdom，夹具来自真实直播/视频 DOM
pnpm compile      # tsc --noEmit
pnpm build
```

图标源文件是 [`assets/icon.svg`](assets/icon.svg)，需要重绘 PNG 时：

```bash
python3 scripts/generate-icons.py
```

## 目录

```
entrypoints/     content / MAIN-world inject / popup / background
utils/           路由、开关、评论过滤、画质、localStorage 补丁
test/            针对真正导出函数的单元测试 + 真实 DOM 夹具
public/icon/     扩展图标
docs/            抖音 DOM 备忘，改版时对照
```

## 限制

- 选择器依赖抖音现有 DOM（`data-e2e`、`webcast-chatroom___*`、`xgplayer-playclarity-setting`）。站点改版后需要对照 [`docs/douyin-dom.md`](docs/douyin-dom.md) 更新。
- Canvas 弹幕只能拦文本绘制；用贴图画出的弹幕拦不住。
- 「屏蔽礼物特效」没有发现可持久化的 localStorage 键，只能反复点 UI。

## 许可证

[MIT](LICENSE)
