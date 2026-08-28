# 抖音网页版 DOM 备忘

抓取时间：2026-08-28。哈希 class 会变，优先用文案和 `data-e2e`。

## 直播地址

- `https://live.douyin.com/{roomId}`
- `https://www.douyin.com/follow/live/{roomId}?anchor_id=...`

## 播放器设置

| 功能 | 入口 | 开关 |
| --- | --- | --- |
| 送礼信息 / 福袋口令 | `[data-e2e="danmaku-setting-icon"]` | 文案 `送礼信息` `福袋口令` |
| 屏蔽礼物特效 | `[data-e2e="gift-setting"]` | `[data-e2e="effect-switch"]` |
| 直播画质 | `[data-e2e="quality-selector"]` | `[data-e2e="quality"]` 当前为「原画」 |

开关 ON：轨道 `background: rgb(254, 44, 85)`，外层 3 个 class，旋钮 2 个 class。  
开关 OFF：半透明白底，外层 2 个 class，旋钮 1 个 class。

相关 storage（`live.douyin.com` 源）：

- `danmakuConfig`：`{ giftOn, packageOn, opacity, area, fontSize, speed }`
- `DanmaSetting_GiftAndPackage`：按 `{userId}_{roomId}` 覆盖，带 `expired`
- `webcast_local_quality`：直播画质，例如 `origin`

礼物特效没有对应的持久化键。

底部礼物栏：`#BottomLayout`，内含 `[data-e2e="gifts-container"]`、`[data-e2e="gifts-switch"]`（更多）、`[data-e2e="recharge-btn"]`（充值）。画质等播放控件不在这个节点里。

「更多直播」：`#TipsLayout` 内指向 `live.douyin.com/?enter_from_merge=...` 的链接。

## 评论

容器：`.webcast-chatroom___list` 是窗口虚拟列表（`data-index` + `translateY`）。行高被改成 0 会抽搐，所以送礼/加分行用 `visibility: hidden` 而不是 `display: none`。

`.webcast-chatroom___item` > `.webcast-chatroom___item-wrapper`

送礼：`送出了` 后跟礼物 `<img>` 和 `×N`。  
加分：`.webcast-chatroom__room-message` 内「为主播加了 n 分」。  
普通评论内容：`.webcast-chatroom___content-with-emoji-text`。  
昵称前徽章：

- 普通评论：`.webcast-chatroom___item-wrapper > div > span:first-child:has(img)`
- 输入框上方粘性提示（来了 / 点赞了）：`.webcast-chatroom___bottom-message`，结构无 `item-wrapper`
- 「加入了直播间」进房条：带 `background-image` 的容器（`new_grade_enter` / `fansclub_effect_icon`）+ 前置 `<img>`

图片 URL 片段：`new_user_grade_level`、`ranklist_fansclub`、`recent_consume_badge`、`fansclub_effect_badge`。

弹幕：`.CanvasDanmakuPlugin > canvas`，`transferControlToOffscreen` 后在名为 `live-canvas-danmaku` 的 Worker 里绘制。主线程 `Worker.postMessage({ method: 'addBarrage', params })`，`params.content` 为 `{ type:'text', text }` / `{ type:'block', content }` 树。主世界的 `fillText` 钩不到 Worker。

## 视频画质

```
.xgplayer-playclarity-setting
  .gear.isSmoothSwitchClarityLogin
    .virtual
      .item            高清 1080P / 720P / 540P
      .item.selected   智能
    .btn               当前档
```

信息流里可能同时存在当前条与预加载条两个 gear，优先 `[data-e2e="feed-active-video"]` 内的那个。

## 头像上方【AI抖音】入口

入口在推荐信息流右侧互动栏、头像上方。稳定 class：`.ai-douyin-entry`。不要用左侧导航 `.tab-aisearch`。

设置弹层：顶栏 / 更多 → 设置 → AI设置。行文案 `头像上方【AI抖音】入口状态`，开关是 Semi Design `.semi-switch`（开：`semi-switch-checked` + `aria-checked="true"`）。

localStorage（`www.douyin.com` 源）：

- `aiEntryClose`：`"1"` 关闭入口，`"0"` 显示入口。点击开关会立刻改这个键。
