import './App.css';

const FEATURES = [
  {
    kicker: '直播',
    text: '每次进房校验：关闭送礼信息、福袋口令，开启屏蔽礼物特效',
  },
  {
    kicker: '评论',
    text: '按结构隐藏「送出了」「为主播加了」等送礼行，并去掉昵称前徽章',
  },
  {
    kicker: '关键字',
    text: '源码内置屏蔽「伯哥」评论与弹幕，无浏览器设置页',
  },
  {
    kicker: '视频',
    text: '非直播场景自动选择当前可用的最高画质，跳过「智能」',
  },
];

function App() {
  return (
    <div className="shell">
      <header className="brand">
        <img src="/icon/128.png" alt="" />
        <div>
          <h1>Better Douyin UX</h1>
          <p>抖音网页版体验补丁，装上即用</p>
        </div>
      </header>
      <ul className="list">
        {FEATURES.map((item) => (
          <li key={item.kicker}>
            <span className="dot" />
            <div>
              <span className="kicker">{item.kicker}</span>
              {item.text}
            </div>
          </li>
        ))}
      </ul>
      <footer className="foot">
        <span>无开关 · 源码即配置</span>
        <a href="https://github.com/meouwu3/better-douyin-ux" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </footer>
    </div>
  );
}

export default App;
