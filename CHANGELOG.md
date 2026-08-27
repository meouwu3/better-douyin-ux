# Changelog

## Unreleased

## 0.2.2 — 2026-08-28

- 弹幕关键字：拦截 CanvasDanmakuPlugin Worker 的 `addBarrage`（OffscreenCanvas 上的 fillText 在 Worker 里，主线程钩不到）

## 0.2.1 — 2026-08-28

- 画质选择不再在 1080P 提前退出；菜单里有 4K/2K 时切到实际最高档

## 0.2.0 — 2026-08-28

- 屏蔽词增加「点点关注」
- 隐藏直播底部礼物栏、充值入口和播放器上的「更多直播」
- 去掉「加入了直播间」进房条和输入框上方粘性提示（来了 / 点赞了）昵称前的徽章
- 直播设置进房应用成功后不再反复展开弹幕/礼物面板
- 评论区按虚拟列表行高隐藏送礼/加分，关键字标记可随行回收清除，减少抽搐
- 扩展图标改为抖音网页版 PWA 标志
- 性能：评论只观察列表新增节点；设置开关不再全页 MutationObserver / 全 DOM 扫标签；路由改用 WXT locationchange
- CI：去掉 workflow 里重复的 pnpm version，改用 `package.json` 的 `packageManager`

## 0.1.0 — 2026-08-28

- 直播间每次进入都校验并关闭「送礼信息」「福袋口令」，开启「屏蔽礼物特效」
- 按 DOM 结构隐藏评论区送礼行（「送出了」「为主播加了」），关键字仅作兜底
- 源码内置屏蔽包含「伯哥」的评论；弹幕为 Canvas，MAIN world 拦截 `fillText`/`strokeText`
- 去掉评论昵称前的等级 / 消费 / 粉丝团徽章
- 非直播视频自动选择当前可用最高画质，跳过「智能」
- 加入扩展图标、popup 说明、单元测试与 CI
