import './App.css';

const FEATURES = [
  {
    kicker: '直播',
    text: '关闭送礼信息、福袋口令，开启屏蔽礼物特效，并隐藏礼物栏、充值和「更多直播」',
  },
  {
    kicker: '评论',
    text: '按结构隐藏「送出了」「为主播加了」等送礼行，去掉昵称前徽章，并隐藏评论区「大家都在搜」',
  },
  {
    kicker: '关键字',
    text: '源码内置屏蔽「伯哥」「点点关注」评论与弹幕，无浏览器设置页',
  },
  {
    kicker: '视频',
    text: '非直播场景自动最高画质；关闭头像上方【AI抖音】入口；隐藏汽水音乐 / 相关搜索 / 识别画面、「个人观点」、「下载抖音精选」和「听抖音」；合集保留',
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
