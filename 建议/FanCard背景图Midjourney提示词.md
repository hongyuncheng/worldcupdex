# WorldCupDex Fan Card 背景图 Midjourney 提示词

球迷身份卡（Fan Card）采用了竖版设计（类似集换式球星卡），所以所有的提示词都需要加上 `--ar 9:16` 来保证生成的图片比例合适。我们需要 3 种不同的风格，每种风格生成 3 张不同的图片。

**尺寸与风格说明：**
- 比例：`--ar 9:16`
- 视觉重点：上方通常是球迷头像和信息，中间偏下是球队和球员卡片，最下方是底部信息。所以背景图的**视觉焦点应尽量偏向两侧或底部**，中间偏上的区域留出相对干净的空间，以免干扰文字阅读。
- 色调：尽量使用深色调（如深蓝、黑金、深紫等），以配合卡片白/金色的文字。

---

## 1. Stadium (经典球场/黑金风格)
> 这是目前的默认风格，强调足球的纯粹、激情、荣耀与大场面感。以深蓝色、深邃的夜空和耀眼的金色灯光为主，融入明显的球场与赛事元素。

*   **Prompt 1 (辉煌穹顶)**: A majestic football stadium at night, viewed from the pitch level looking up. Brilliant golden floodlights piercing through the dark blue night sky. A classic black and white football resting on the glowing green grass in the foreground. Epic, cinematic lighting, deep blue and gold color palette, high contrast, 8k resolution, photorealistic, sports background. --ar 9:16 --v 6.0
*   **Prompt 2 (光影隧道)**: The entrance tunnel to a world-class football stadium, dramatic lighting with deep navy shadows and bright golden rim lights. A glowing golden World Cup trophy prominently silhouette in the center of the pitch at the end of the tunnel. Epic atmosphere, anticipation, cinematic depth of field, high end sports graphic design background. --ar 9:16 --v 6.0
*   **Prompt 3 (荣耀看台)**: Abstract geometric background inspired by modern football stadium architecture. Dark midnight blue intersecting planes with glowing gold edges. A massive, subtly glowing outline of a football stadium roof structure fading into the background. Clean, premium, elegant, dark mode sports UI background, soft gradients. --ar 9:16 --v 6.0

---

## 2. Cyberpunk (赛博朋克/霓虹风格)
> 具有未来感、科技感，适合年轻球迷。色彩以霓虹粉、电光蓝、荧光绿为主，搭配黑色背景，融入极具科幻感的足球元素。

*   **Prompt 1 (霓虹球场)**: A futuristic cyberpunk football stadium, glowing neon lines outlining the pitch in electric blue and hot pink. A high-tech glowing holographic football floating in the center. Dark moody atmosphere with digital data elements. High tech sports background, synthwave color palette, unreal engine 5 render, hyper-detailed. --ar 9:16 --v 6.0
*   **Prompt 2 (数据洪流)**: Abstract dark background with vertical streams of glowing neon data, digital binary code forming the shape of a golden World Cup trophy in the center. Dark purple and cyan gradients, glowing fiber optic lines. Futuristic UI background, cyberpunk aesthetic, clean composition, 8k. --ar 9:16 --v 6.0
*   **Prompt 3 (电光火石)**: Dynamic abstract sports background featuring glowing energy trails and electric sparks in neon magenta and cyan against a pitch black background. A futuristic metallic football shattering into glowing neon fragments. Flowing motion lines, high energy, futuristic, sleek, neon lights. --ar 9:16 --v 6.0

---

## 3. Glory Gold (荣耀黑金风格)
> 极致的高级感与荣耀感，以深邃的纯黑色为底色，搭配奢华、流动的液态黄金或金箔纹理。足球与奖杯以艺术品般的雕塑质感呈现。

*   **Prompt 1 (流金岁月)**: Abstract luxury background featuring smooth, flowing liquid gold ribbons over a pitch black background. A highly detailed, realistic golden World Cup trophy rising elegantly from the golden ripples. Deep shadows, highly reflective metallic gold surfaces, elegant curves, premium sports card design background, 8k resolution, cinematic lighting. --ar 9:16 --v 6.0
*   **Prompt 2 (金沙暗影)**: Dark elegant background with subtle gold dust and particles floating in the air. A majestic, sculpted black and gold football hovering in the center. Rich black negative space, dramatic rim lighting, luxury aesthetic, clean and sophisticated, 3D render. --ar 9:16 --v 6.0
*   **Prompt 3 (黑金几何)**: Modern premium background with intersecting matte black geometric panels and glowing gold illuminated edges. A sleek, abstract wireframe model of a football stadium in glowing gold lines in the background. Minimalist luxury sports UI design, sharp contrast, subtle carbon fiber texture on the dark panels, high-end, sleek. --ar 9:16 --v 6.0

---

### 📌 后续操作指南：
1. 使用 Midjourney 生成上述图片后，挑选出最满意的 9 张（每种风格 3 张）。
2. 将图片压缩并转换为 `webp` 格式（推荐尺寸 800x1422 左右，以保证清晰度且文件小）。
3. 将图片放入项目中对应的目录：
   - `public/images/fan-card/themes/stadium/1.webp` (或者保留现在的 fancard-bg-v3.png)
   - `public/images/fan-card/themes/stadium/2.webp`
   - `public/images/fan-card/themes/stadium/3.webp`
   - `public/images/fan-card/themes/cyberpunk/1.webp` ~ `3.webp`
   - `public/images/fan-card/themes/glory-gold/1.webp` ~ `3.webp`
4. 放入文件后，页面上的“主题切换”功能即可完美生效。