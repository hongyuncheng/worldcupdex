# WorldCupDex Quiz Result 背景图 Midjourney 提示词

World Cup IQ / Trivia 挑战结果卡片将采用统一的竖版设计（类似 Fan Card，比例 9:16），我们需要为高级版生成 3 种不同风格的背景图，每种风格先生成 2 张。
所有的提示词都需要加上 `--ar 9:16`。

**尺寸与风格说明：**
- 比例：`--ar 9:16`
- 视觉重点：结果卡片中央会有一个巨大的圆形进度条和分数，上方是标题，下方是评级和数据。因此背景图的**视觉焦点应尽量偏向四周**，中间区域留出相对干净的空间或使用柔和的渐变，以免干扰进度条和分数的阅读。
- 色调：尽量使用深色调（如深蓝、深紫、黑金等），以配合卡片上高亮的荧光色和金色。

---

## 1. Classic Stadium (经典球场/智力挑战风格)
> 强调足球比赛的大场面与智慧的结合。以深蓝色、夜空、球场灯光为主，融入微妙的数据或战术板元素。

*   **Prompt 1 (战术之光)**: A majestic football stadium at night, viewed from the pitch level. Brilliant golden floodlights piercing through the dark blue night sky. Subtle, glowing tactical formation lines and arrows hovering faintly in the air. The center of the image is relatively clean and dark. Epic, cinematic lighting, deep blue and gold color palette, high contrast, 8k resolution, photorealistic, sports trivia background. --ar 9:16 --v 6.0
*   **Prompt 2 (智慧穹顶)**: Abstract background inspired by modern football stadium architecture and intelligence. Dark midnight blue intersecting planes with glowing gold edges. A massive, subtly glowing outline of a football resting on a glossy surface, with faint glowing numbers and data streams in the background. Clean, premium, elegant, dark mode sports UI background, soft gradients in the center. --ar 9:16 --v 6.0

---

## 2. Cyberpunk / Data (赛博朋克/数据风)
> 具有未来感、科技感，突出“IQ”和“数据分析”的概念。色彩以霓虹紫、电光蓝、荧光绿为主，融入科幻感的足球和数据流。

*   **Prompt 1 (赛博脑力)**: A futuristic cyberpunk sports background, glowing neon lines outlining a football pitch in electric blue and hot pink. Faint holographic brain and digital binary code merging with a football in the background. The center is dark and moody, surrounded by glowing data elements. High tech sports background, synthwave color palette, unreal engine 5 render, hyper-detailed. --ar 9:16 --v 6.0
*   **Prompt 2 (数据矩阵)**: Abstract dark background with vertical streams of glowing neon data and hex codes, forming the subtle shape of a glowing World Cup trophy. Dark purple and cyan gradients, glowing fiber optic lines wrapping around the edges. The center is left clean with deep shadows. Futuristic UI background, cyberpunk aesthetic, IQ test concept, 8k. --ar 9:16 --v 6.0

---

## 3. Glory Gold (荣耀黑金)
> 极致的高级感与荣耀感，以深邃的纯黑色为底色，搭配奢华、流动的液态黄金或金箔纹理，象征答题满分的最高荣誉。

*   **Prompt 1 (流金桂冠)**: Abstract luxury background featuring smooth, flowing liquid gold ribbons and laurel wreaths over a pitch black background. The golden ribbons frame the edges of the image, leaving a deep black abyss in the center. Highly reflective metallic gold surfaces, elegant curves, premium sports trivia card design background, 8k resolution, cinematic lighting. --ar 9:16 --v 6.0
*   **Prompt 2 (金沙荣耀)**: Dark elegant background with subtle gold dust, glowing particles, and floating golden confetti. A majestic, subtly sculpted black and gold football hovering faintly in the lower background. Rich black negative space in the center, dramatic rim lighting, luxury aesthetic, clean and sophisticated, 3D render. --ar 9:16 --v 6.0

---

### 📌 后续操作指南：
1. 使用 Midjourney 生成上述图片后，挑选出最满意的 6 张（每种风格 2 张）。
2. 将图片压缩并转换为 `webp` 格式（推荐尺寸 800x1000 左右，以保证清晰度且文件小）。
3. 将图片放入项目中对应的目录：
   - `public/images/quiz/Classic/1.webp`
   - `public/images/quiz/Classic/2.webp`
   - `public/images/quiz/Cyberpunk/1.webp`
   - `public/images/quiz/Cyberpunk/2.webp`
   - `public/images/quiz/GloryGold/1.webp`
   - `public/images/quiz/GloryGold/2.webp`
4. 代码中已经预留了相关的目录结构和读取逻辑，放入文件后功能即可生效。