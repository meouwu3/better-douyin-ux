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

## 评论

容器：`.webcast-chatroom___item` > `.webcast-chatroom___item-wrapper`

送礼：`送出了` 后跟礼物 `<img>` 和 `×N`。  
加分：`.webcast-chatroom__room-message` 内「为主播加了 n 分」。  
普通评论内容：`.webcast-chatroom___content-with-emoji-text`。  
昵称前徽章：wrapper 内第一个带 `img` 的 `span`（等级 / 消费 / 粉丝团）。

弹幕：`.CanvasDanmakuPlugin > canvas`，不是 DOM 节点。

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
