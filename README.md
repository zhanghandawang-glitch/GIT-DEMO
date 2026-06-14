# ⬡ 守望先锋 · 练枪软件 | Overwatch Aim Trainer

一个专为《守望先锋》玩家设计的浏览器端练枪软件。支持移动靶（跟枪）、瞬移靶（甩枪）和结合靶（实战模拟）三种训练模式，拥有守望先锋主题的视觉风格和合成背景音乐。

## ✨ 功能特色

### 🎯 三种训练模式
| 模式 | 描述 | 练习目标 |
|------|------|----------|
| **移动靶 (Tracking)** | 目标沿正弦/圆形/锯齿路径移动，需多次命中 | 跟枪追踪能力 |
| **瞬移靶 (Flicking)** | 目标随机出现，单击击杀，有时限 | 甩枪精准定位 |
| **结合靶 (Combined)** | 60% 移动靶 + 40% 瞬移靶混合 | 综合实战模拟 |

### 🖱️ 鼠标速度预设
- 5 个可自定义的 DPI 记忆模式（可扩展到 10 个）
- 每个预设可设置名称、DPI 值、游戏内灵敏度
- 一键切换，设置面板位于右下角
- 按键盘 `1-5` 快速切换预设
- 所有设置自动保存到 localStorage

### 🎨 守望先锋主题
- 橙蓝配色方案（`#F99E1A` 守望橙 + `#218FFE` 蓝）
- 动态六边形浮动背景 + 星场动画
- Orbitron 未来感字体
- 击中粒子效果、连击弹幕文字
- 扫描线叠加效果（菜单画面）

### 🔊 音频系统
- 合成氛围背景音乐（Am-F-C-G 和弦进行）
- 命中/击杀/未命中音效
- 连击里程碑音效（Nice! → Great! → ON FIRE! → GODLIKE!）
- 倒计时音效
- 可调节主音量、独立控制背景音乐和音效开关

### 📊 数据统计
- 单局：分数、命中率、命中/未命中数、最大连击
- 历史：最佳分数、最佳命中率、总游戏时间、各模式统计
- 新纪录提示

### ⌨️ 键盘快捷键
| 按键 | 功能 |
|------|------|
| `ESC` | 暂停/继续 |
| `R` | 重新开始 |
| `M` | 返回菜单（暂停时） |
| `1-5` | 切换鼠标速度预设 |

## 🚀 使用方法

1. 在浏览器中打开 `index.html`（需要本地服务器或直接打开）
2. 选择训练模式（移动靶 / 瞬移靶 / 结合靶）
3. 选择难度和时长
4. 点击「开始」→ Pointer Lock 激活 → 3-2-1-GO!
5. 瞄准并点击射击！
6. 完成后查看成绩，再来一次或切换模式

## 🛠️ 技术栈

- **HTML5 Canvas** — 游戏渲染（目标、粒子、准星）
- **CSS3** — UI 布局和动画
- **Vanilla JavaScript** — 零依赖，纯原生 JS
- **Pointer Lock API** — 原始无加速鼠标输入
- **Web Audio API** — 合成音频（音效 + 背景音乐）
- **localStorage** — 设置和统计数据持久化

## 📁 项目结构

```
├── index.html              # 入口页面，完整 DOM 结构
├── css/
│   └── style.css           # 全部样式（守望先锋主题）
├── js/
│   ├── app.js              # 应用入口，会话生命周期
│   ├── config.js           # 常量、默认值、配置
│   ├── state.js            # 集中式全局状态
│   ├── game-loop.js        # requestAnimationFrame 主循环
│   ├── canvas.js           # Canvas 初始化与渲染
│   ├── background.js       # 动态背景（六边形+星场）
│   ├── targets.js          # Target 类 + TargetManager
│   ├── spawner.js          # 三模式生成逻辑
│   ├── input.js            # Pointer Lock + 鼠标输入 + 键盘
│   ├── effects.js          # 粒子系统（命中/爆炸/文字）
│   ├── scoring.js          # 计分、连击、统计
│   ├── hud.js              # DOM HUD 覆盖层
│   ├── audio.js            # Web Audio API 音频管理
│   ├── settings-panel.js   # 右下角设置面板
│   ├── mode-selector.js    # 模式选择界面
│   └── storage.js          # localStorage 读写封装
└── README.md
```

## 🌐 浏览器兼容性

- ✅ Google Chrome（推荐）
- ✅ Microsoft Edge
- ✅ Mozilla Firefox
- ⚠️ Safari（Pointer Lock 支持有限）

## 📝 开发说明

- 游戏以 `requestAnimationFrame` 驱动，使用 delta-time 确保不同刷新率下行为一致
- Pointer Lock API 提供原始鼠标输入——这是精准练枪的核心
- 音频系统使用 Web Audio API 合成，无需外部音频文件即可运行
- 如需替换背景音乐，可将 MP3 文件放入 `assets/audio/` 目录

## 📄 许可

MIT License — 仅供学习和娱乐使用。

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
