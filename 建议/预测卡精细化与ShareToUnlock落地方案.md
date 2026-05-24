# 预测卡精细化与 "Share to Unlock" 落地方案

本方案旨在通过**极具视觉冲击力的预置 AI 背景图**和**动态生成的 Trash Talk (赞美/点评标语)**，结合宽容的分享解锁机制，打造具备极强“社交货币”属性的世界杯预测卡片，从而实现免费的病毒式流量裂变。

---

## 一、 AI 背景图生图 Prompt (共 4 种风格，每种 5 张)

> **生图前置说明**：
> 1. **核心原则**：不再一味追求“黑暗和留白”，而是追求**明亮、干净、具有视觉张力**的底图。在前端我们可以通过给文字加上发光或半透明底板来保证可读性，千万不要让背景图本身显得压抑。
> 2. **宽高比**：如果卡片用于手机分享，请在提示词末尾加上 `--ar 9:16`；如果是横版卡片，加上 `--ar 16:9`。

### 风格 1：街头涂鸦风 (Street Graffiti) - 适合 Z 世代/青少年，充满活力
*   **Prompt 1 (彩色喷漆)**: A vibrant, energetic street art background. Colorful graffiti spray paint splatters and bold abstract shapes on a bright white and light grey brick wall. Elements of footballs and dynamic arrows. High key lighting, pop art aesthetic, extremely colorful and youth-oriented, clean central area. 8k, highly detailed.--ar 9:16
*   **Prompt 2 (波普艺术)**: Pop art style background with bright solid colors (yellow, cyan, magenta). Halftone dot patterns, comic book style action lines exploding outwards. Bright and cheerful, flat vector art style. Perfect for a fun sports UI card. 8k resolution.--ar 9:16
*   **Prompt 3 (霓虹涂鸦)**: Bright daytime neon graffiti. Glowing pastel colors (pink, lime green, bright orange) painted on a clean white concrete wall. Drip effects and energetic swooshes. Bright, modern, Gen-Z aesthetic, very clean and legible center. 8k.--ar 9:16
*   **Prompt 4 (贴纸轰炸)**: A fun background entirely covered in overlapping, colorful flat vector stickers related to football, world cup, and hype words. The colors are bright and pastel. A large, clean, frosted glass circle in the center. Playful, youthful, kawaii aesthetic. 8k.--ar 9:16
*   **Prompt 5 (手绘速写)**: Doodle art style background. Energetic pencil and marker sketches of football tactics, stars, and trophies on a bright, slightly textured off-white paper background. Messy but creative and bright. High energy, 8k resolution.--ar 9:16

### 风格 2：清新扁平风 (Clean Flat Vector) - 适合大众/儿童，极简舒适
*   **Prompt 1 (阳光绿茵)**: A bright, cheerful flat vector illustration of a sunny football pitch. Minimalist geometric shapes, bright lime green grass, clear blue sky with fluffy white clouds. Very clean, no complex textures, high contrast, perfect for UI. 8k.--ar 9:16
*   **Prompt 2 (剪纸艺术)**: Paper-cut illustration style background. Layers of bright colored paper (sky blue, mint green, warm yellow) forming abstract hills and a football stadium. Soft, warm lighting, very clean and soothing aesthetic. 8k resolution.--ar 9:16
*   **Prompt 3 (3D 卡通黏土)**: 3D claymorphism style background. A cute, soft, chunky football stadium with bright pastel colors (bubblegum pink, baby blue). Smooth matte textures, very bright and playful. Isometric view, clean center. 8k, Unreal Engine render style.--ar 9:16
*   **Prompt 4 (动态几何)**: Abstract geometric background. Large, overlapping circles and rounded rectangles in bright, energetic sports colors (vibrant orange, bright cyan, pure white). Flat design, clean lines, no shadows. Very modern and readable. 8k.--ar 9:16
*   **Prompt 5 (像素风球场)**: 16-bit pixel art style football pitch background. --ar 9:16Bright, saturated colors, retro arcade game aesthetic. Very clean, nostalgic, and fun. Light green and white color palette. 8k resolution.--ar 9:16

### 风格 3：高级磨砂玻璃风 (Glassmorphism) - 适合追求质感的用户，现代科技感
*   **Prompt 1 (极光玻璃)**: Abstract background with a vibrant, flowing aurora borealis gradient (bright teal, purple, pink) underneath a layer of frosted glass. The colors are bright and luminous. Clean, modern UI aesthetic, highly detailed glass texture. 8k.--ar 9:16
*   **Prompt 2 (晨曦透射)**: Bright morning sunlight refracting through overlapping layers of frosted glass plates. The background colors are soft, warm peach and light sky blue. Clean, elegant, premium corporate style. 8k resolution.--ar 9:16
*   **Prompt 3 (多彩亚克力)**: Bright, translucent acrylic shapes (spheres, cylinders) floating in a bright white studio environment. Vivid colors refracting through the plastic. Ultra-clean, modern, 3D render, high key lighting. 8k.--ar 9:16
*   **Prompt 4 (全息反光)**: Bright holographic foil texture background. Iridescent colors (silver, light pink, cyan) shifting in bright light. Very smooth, futuristic but bright and airy. Clean central space. 8k resolution.--ar 9:16
*   **Prompt 5 (纯白液态金属)**: Abstract background of flowing, bright white liquid metal. Smooth, highly reflective but very bright (high key lighting), soft shadows. Extremely premium and minimalist. 8k.--ar 9:16

### 风格 4：激情赛场风 (Stadium Vibe) - 适合硬核球迷，追求现场感但不压抑
*   **Prompt 1 (阳光灿烂的看台)**: A breathtaking view of a massive football stadium during a bright, sunny afternoon. The stands are filled with colorful, blurred flags. The green pitch is vibrant and fully lit by the sun. Cheerful, epic, high definition, 8k.--ar 9:16
*   **Prompt 2 (五彩纸屑)**: A celebratory stadium background. Bright blue sky, massive amounts of colorful confetti (red, white, blue, yellow) falling through the air. The scene is incredibly bright, victorious, and energetic. 8k resolution.--ar 9:16
*   **Prompt 3 (球员视角)**: A bright, wide-angle view from the center of the football pitch looking up at the sky and stadium roof. Bright daylight, clear blue sky, vibrant green grass. Clean, open, inspiring. 8k.--ar 9:16
*   **Prompt 4 (高光时刻)**: Abstract sports background featuring bright, intense white and blue stadium spotlights shining through a light mist. The overall tone is bright and electrifying, not dark. High energy, 8k.--ar 9:16
*   **Prompt 5 (光影草坪)**: Close up of vibrant, perfectly manicured football grass under bright stadium lights. Crisp, clean textures, high saturation, very bright and inviting. Perfect negative space for text. 8k.--ar 9:16

---

## 二、 动态赞美/点评标语 (Smart Catchphrases)

根据用户预测的**分差 (Goal Difference)** 和**进球总数**，前端动态从以下题库中随机抽取一句，印在高级卡片上。

**1. 预测结果是“大胜/屠杀” (分差 ≥ 3，如 3:0, 4:1)：**
*   "An absolute masterclass!" (绝对的大师级表演！)
*   "No mercy. Total domination." (毫无怜悯的全面压制。)
*   "A footballing lesson taught today." (今天上演了一场足球教学局。)
*   "They didn't just win, they conquered." (他们不仅仅是赢了，而是征服了对手。)
*   "Flawless victory. What a performance!" (完美无瑕的胜利。多么精彩的表演！)

**2. 预测结果是“险胜/绝杀” (分差 = 1，如 1:0, 2:1)：**
*   "Down to the wire! What a thriller." (悬念留到了最后一秒！真是惊心动魄。)
*   "A tactical masterpiece. Hard-fought win." (战术大师之作。一场艰难的胜利。)
*   "Ice in their veins when it mattered most." (关键时刻展现大心脏。)
*   "Margins define champions. Great game." (细节决定冠军。好球。)
*   "Survival of the fittest." (适者生存。)

**3. 预测结果是“高比分平局” (如 2:2, 3:3) - 强调精彩程度：**
*   "An absolute goalfest! Football wins today." (绝对的进球盛宴！今天足球是赢家。)
*   "A beautiful mess. What an entertaining draw." (美丽的混乱。多么具有娱乐性的平局。)
*   "Two heavyweights trading blows." (两个重量级拳手的互殴。)
*   "Neither team deserved to lose this classic." (两队都不该输掉这场经典对决。)

**4. 预测结果是“沉闷平局” (如 0:0, 1:1) - 强调战术博弈：**
*   "A chess match on the pitch." (球场上的国际象棋博弈。)
*   "Defenses stood tall today." (今天防守端表现出色。)
*   "Nothing to separate these two warriors." (难分伯仲的两位勇士。)

---

## 三、 "Share to Unlock" 前端交互与防作弊逻辑

### 1. 用户操作路径
1.  用户在 `/predict/[id]` 页面提交预测比分。
2.  页面展示渲染好的**普通版卡片**（纯色背景，带网站水印）。
3.  在普通卡片上方/下方，展示一个**高级版卡片的高斯模糊缩略图**，并配有文案："Want to show off in style? Unlock the Premium AI Background for FREE!"
4.  用户点击“Unlock”按钮，弹出分享模态框（包含 "Share to X/Twitter", "Share to Facebook", "Copy Link"）。
5.  用户点击任意分享按钮后，页面播放庆祝动画（Confetti），随即重新渲染出清晰的**高级版卡片**供用户保存。

### 2. 宽容防作弊策略
*   由于浏览器安全限制，无法准确监听用户在第三方社交平台是否真正点击了“发送”。
*   **策略**：只要用户在模态框中**点击了**分享按钮（触发了 URL 跳转）或**点击了**复制链接，即视为“分享成功”。
*   **业务逻辑**：哪怕有 30% 的用户“白嫖”，另外 70% 的真实分享所带来的流量也足以覆盖开发成本。过度严格的验证会极大降低转化率。

### 3. 状态留存（提升用户体验）
*   当用户完成一次解锁后，前端在 `localStorage` 中写入标记：`has_unlocked_premium: true`。
*   只要该标记存在，用户后续所有的预测都将**默认直接使用高级版模板**，并提示 "Welcome back, Premium Predictor!"，鼓励用户持续回访并生成更多卡片。

---

## 四、 下一步执行计划
1.  使用第一部分的 Prompt 在 GPT-5/Midjourney 中生成 20 张背景图。
2.  挑选效果最好的图片，压缩后存入项目的 `public/images/premium-bgs/` 目录。
3.  在 `components/PredictionCard.vue` 中开发 `isPremium` 状态下的高级 UI 样式。
4.  将第二部分的“赞美标语”写入配置库，并编写 `computed` 属性根据比分自动匹配标语。
5.  开发 Share to Unlock 的模态框交互和 `localStorage` 留存逻辑。