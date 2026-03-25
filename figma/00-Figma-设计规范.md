# 📐 PingPong AI - Figma 设计规范

> 可直接复制 to Figma 的完整设计规范  
> 版本：V3.0 | 日期：2026-03-25

---

## 一、Figma 设置

### 1.1 画布设置

```
Frame 尺寸：
- iPhone 15 Pro: 393 x 852
- iPhone 15 Pro Max: 430 x 932
- iPad Pro 11": 834 x 1194
- Desktop: 1440 x 1024

Grid 设置:
- Layout Grid: Columns (4 列，手机)
- Margin: 20px
- Gutter: 16px
- Baseline Grid: 8px
```

### 1.2 颜色样式 (Color Styles)

创建以下 Color Styles（命名格式：`Color/Category/Name`）：

#### 主色 Primary

| 名称 | 色值 | 用途 |
|------|------|------|
| `Color/Primary/Blue` | `#0066FF` | 主按钮、品牌色 |
| `Color/Primary/Blue Light` | `#00C6FF` | 渐变、悬停 |
| `Color/Primary/Blue Dark` | `#0052CC` | 按下状态 |

#### 强调色 Accent

| 名称 | 色值 | 用途 |
|------|------|------|
| `Color/Accent/Orange` | `#FF6B35` | CTA、强调 |
| `Color/Accent/Orange Light` | `#FF8E53` | 渐变、悬停 |

#### 功能色 Functional

| 名称 | 色值 | 用途 |
|------|------|------|
| `Color/Functional/Success` | `#00C853` | 成功、进步 |
| `Color/Functional/Success Light` | `#69F0AE` | 渐变 |
| `Color/Functional/Error` | `#FF3B30` | 错误、警告 |
| `Color/Functional/Warning` | `#FF9500` | 警示 |
| `Color/Functional/Info` | `#007AFF` | 信息 |

#### 中性色 Neutral

| 名称 | 色值 | 用途 |
|------|------|------|
| `Color/Neutral/Black` | `#0D1117` | 深色背景 |
| `Color/Neutral/Gray 900` | `#161B22` | 深色卡片 |
| `Color/Neutral/Gray 700` | `#30363D` | 边框 |
| `Color/Neutral/Gray 500` | `#8B949E` | 次要文字 |
| `Color/Neutral/Gray 300` | `#D0D7DE` | 占位符 |
| `Color/Neutral/Gray 100` | `#F0F6FC` | 浅色背景 |
| `Color/Neutral/White` | `#FFFFFF` | 浅色卡片 |

#### 渐变色 Gradients

| 名称 | 色值 | 角度 | 用途 |
|------|------|------|------|
| `Gradient/Primary` | `#0066FF` → `#00C6FF` | 135° | Hero、主按钮 |
| `Gradient/Success` | `#00C853` → `#69F0AE` | 135° | 成功、高分 |
| `Gradient/Vibrant` | `#FF6B35` → `#FF8E53` | 135° | CTA、推荐 |
| `Gradient/Dark Card` | `#161B22` → `#0D1117` | 180° | 深色卡片 |

---

## 二、文本样式 (Text Styles)

创建以下 Text Styles（命名格式：`Type/Level/Weight`）：

### 2.1 标题

| 名称 | 字体 | 字号 | 行高 | 字重 | 字间距 |
|------|------|------|------|------|--------|
| `Type/Display/Bold` | PingFang SC | 32px | 40px | Bold (700) | -1% |
| `Type/H1/SemiBold` | PingFang SC | 24px | 32px | SemiBold (600) | -0.5% |
| `Type/H2/SemiBold` | PingFang SC | 20px | 28px | SemiBold (600) | 0% |
| `Type/H3/Medium` | PingFang SC | 18px | 26px | Medium (500) | 0% |

### 2.2 正文

| 名称 | 字体 | 字号 | 行高 | 字重 | 字间距 |
|------|------|------|------|------|--------|
| `Type/Body/Regular` | PingFang SC | 16px | 24px | Regular (400) | 0% |
| `Type/Body/Medium` | PingFang SC | 16px | 24px | Medium (500) | 0% |
| `Type/Caption/Regular` | PingFang SC | 14px | 20px | Regular (400) | 0% |
| `Type/Small/Regular` | PingFang SC | 12px | 16px | Regular (400) | 0% |

### 2.3 数字

| 名称 | 字体 | 字号 | 行高 | 字重 | 用途 |
|------|------|------|------|------|------|
| `Type/Number/Display` | DIN Alternate | 48px | 56px | Bold (700) | 大数字 |
| `Type/Number/Large` | DIN Alternate | 32px | 40px | Bold (700) | 分数 |
| `Type/Number/Medium` | DIN Alternate | 24px | 32px | SemiBold (600) | 统计 |

---

## 三、效果样式 (Effect Styles)

### 3.1 阴影 (Shadows)

| 名称 | X | Y | Blur | Spread | Color | Opacity |
|------|---|---|------|--------|-------|---------|
| `Shadow/Sm` | 0 | 2px | 8px | 0 | #000000 | 8% |
| `Shadow/Md` | 0 | 4px | 16px | 0 | #000000 | 12% |
| `Shadow/Lg` | 0 | 8px | 32px | 0 | #000000 | 16% |
| `Shadow/Xl` | 0 | 12px | 48px | 0 | #000000 | 20% |
| `Shadow/Color` | 0 | 8px | 32px | 0 | #0066FF | 24% |
| `Shadow/Inner` | 0 | 2px | 4px | 0 | #000000 | 10% (Inner) |

### 3.2 模糊 (Blur)

| 名称 | 值 | 用途 |
|------|-----|------|
| `Blur/Background` | 20 | 毛玻璃背景 |
| `Blur/Modal` | 8 | 弹窗背景 |

---

## 四、组件库 (Components)

### 4.1 按钮 (Buttons)

#### Primary Button

```
Frame:
- Height: 52px
- Corner Radius: 12px
- Fill: Gradient/Primary
- Effect: Shadow/Md

Text:
- Style: Type/Body/Medium
- Color: #FFFFFF
- Auto Layout: Center

States:
- Default: 如上
- Hover: Scale 1.02, Shadow/Color
- Pressed: Scale 0.98, Fill: Color/Primary/Blue Dark
- Disabled: Opacity 50%
```

#### Secondary Button

```
Frame:
- Height: 52px
- Corner Radius: 12px
- Fill: #FFFFFF (Light) / #161B22 (Dark)
- Stroke: 1px, Color/Primary/Blue
- Effect: Shadow/Sm

Text:
- Style: Type/Body/Medium
- Color: Color/Primary/Blue
```

#### Ghost Button

```
Frame:
- Height: 44px
- Corner Radius: 8px
- Fill: Transparent

Text:
- Style: Type/Body/Medium
- Color: Color/Primary/Blue
```

#### Icon Button

```
Frame:
- Size: 44x44px
- Corner Radius: 50%
- Fill: Transparent / Color/Neutral/Gray 100

Icon:
- Size: 24x24px
- Color: Color/Neutral/Gray 700
```

---

### 4.2 卡片 (Cards)

#### Stat Card

```
Frame:
- Padding: 20px
- Corner Radius: 20px
- Fill: #FFFFFF (Light) / #161B22 (Dark)
- Effect: Shadow/Md

Content:
- Label: Type/Caption/Regular, Color/Neutral/Gray 500
- Value: Type/Number/Large, Color/Primary/Blue
```

#### Action Card

```
Frame:
- Height: 80px
- Padding: 16px
- Corner Radius: 16px
- Fill: #FFFFFF (Light) / #161B22 (Dark)
- Effect: Shadow/Sm

Layout:
- Auto Layout: Horizontal
- Spacing: 16px
- Alignment: Center

Content:
- Icon: 48x48px circle, gradient fill
- Title: Type/Body/Medium
- Description: Type/Caption/Regular, Color/Neutral/Gray 500
- Arrow: 24x24px, Color/Neutral/Gray 500
```

#### Result Card

```
Frame:
- Padding: 20px
- Corner Radius: 16px
- Fill: #FFFFFF (Light) / #161B22 (Dark)
- Effect: Shadow/Md
- Stroke: 4px (left side), color based on type

Types:
- Success: Stroke Color/Functional/Success
- Warning: Stroke Color/Functional/Warning
- Error: Stroke Color/Functional/Error
```

---

### 4.3 输入框 (Inputs)

#### Text Input

```
Frame:
- Height: 52px
- Corner Radius: 12px
- Fill: Color/Neutral/Gray 100 (Light) / #0D1117 (Dark)
- Stroke: 1px, Color/Neutral/Gray 300

Text:
- Style: Type/Body/Regular
- Color: Color/Neutral/Black (Light) / #FFFFFF (Dark)
- Placeholder: Color/Neutral/Gray 500

States:
- Default: 如上
- Focused: Stroke: Color/Primary/Blue, Shadow/Color
- Error: Stroke: Color/Functional/Error
- Disabled: Opacity 50%
```

---

### 4.4 导航 (Navigation)

#### Tab Bar

```
Frame:
- Height: 83px (including safe area)
- Fill: #FFFFFF (Light) / #161B22 (Dark)
- Effect: Shadow/Inner (top)

Layout:
- Auto Layout: Horizontal
- Spacing: 0
- Padding: 0, 16px (safe area)

Tab Item:
- Width: Equal distribution
- Auto Layout: Vertical
- Spacing: 4px
- Icon: 24x24px
- Label: Type/Small/Regular

States:
- Active: Icon/Label Color/Primary/Blue
- Inactive: Icon/Label Color/Neutral/Gray 500
```

#### Top Bar

```
Frame:
- Height: 44px (excluding status bar)
- Fill: Transparent

Layout:
- Auto Layout: Horizontal
- Spacing: 16px
- Padding: 0, 16px

Content:
- Back Button: Icon Button
- Title: Type/H2/SemiBold, Center
- Action: Icon Button (right)
```

---

### 4.5 数据展示 (Data Display)

#### Score Badge

```
Frame:
- Size: 64x64px (can vary)
- Corner Radius: 50%
- Fill: Based on score
  - 90-100: Gradient/Success
  - 70-89: Gradient/Primary
  - 50-69: Gradient/Vibrant
  - 0-49: Color/Functional/Error

Text:
- Style: Type/Number/Large
- Color: #FFFFFF
- Alignment: Center
```

#### Progress Bar

```
Track:
- Height: 8px
- Corner Radius: 4px
- Fill: Color/Neutral/Gray 100

Fill:
- Height: 8px
- Corner Radius: 4px
- Fill: Gradient (based on progress)

Label:
- Position: Above or inside
- Style: Type/Caption/Regular
```

#### Stat Grid

```
Frame:
- Auto Layout: Grid (3 columns)
- Spacing: 12px
- Padding: 16px

Item:
- Auto Layout: Vertical
- Spacing: 8px
- Alignment: Center

Content:
- Value: Type/Number/Medium
- Label: Type/Caption/Regular, Color/Neutral/Gray 500
```

---

### 4.6 反馈组件 (Feedback)

#### Toast

```
Frame:
- Min Width: 280px
- Height: Auto (min 48px)
- Corner Radius: 12px
- Fill: Color/Neutral/Black (90% opacity)
- Effect: Shadow/Lg

Layout:
- Auto Layout: Horizontal
- Spacing: 12px
- Padding: 16px, 20px

Content:
- Icon: 24x24px (optional)
- Message: Type/Body/Regular, #FFFFFF
```

#### Alert Dialog

```
Frame:
- Width: 320px
- Corner Radius: 20px
- Fill: #FFFFFF (Light) / #161B22 (Dark)
- Effect: Shadow/Xl

Layout:
- Auto Layout: Vertical
- Spacing: 16px
- Padding: 24px

Content:
- Icon: 48x48px (optional)
- Title: Type/H2/SemiBold
- Message: Type/Body/Regular, Color/Neutral/Gray 500
- Actions: Button Row (gap 12px)
```

---

## 五、页面框架 (Page Templates)

### 5.1 首页框架

```
Frame: iPhone 15 Pro (393 x 852)

Layers:
├── Status Bar (44px)
├── Hero Section (200px)
│   ├── Brand (Logo + Tagline)
│   └── Stats Card
├── Quick Actions (280px)
│   └── 3 Action Cards
├── Recent Analysis (200px)
│   └── List Items
├── Recommended (160px)
│   └── Horizontal Scroll
└── Tab Bar (83px)

Constraints:
- All content: Left & Right (20px margin)
- Tab Bar: Bottom, Left & Right
```

### 5.2 分析结果页框架

```
Frame: iPhone 15 Pro (393 x 852)

Layers:
├── Status Bar (44px)
├── Top Bar (44px)
│   ├── Back Button
│   ├── Title
│   └── Share Button
├── Scroll Content
│   ├── Score Section (200px)
│   ├── Metrics Grid (120px)
│   ├── Problems List (variable)
│   └── Actions (80px)
└── Bottom Actions (80px, fixed)

Constraints:
- Scroll: Top & Bottom (to actions)
- Bottom Actions: Bottom, Left & Right
```

### 5.3 动作对比页框架

```
Frame: iPhone 15 Pro (393 x 852)

Layers:
├── Status Bar (44px)
├── Top Bar (44px)
├── Video Compare (320px)
│   ├── Standard Video (left)
│   └── User Video (right)
├── Controls (60px)
│   └── Play/Pause Buttons
├── Metrics Compare (variable)
│   └── Progress Bars
└── Actions (80px)

Constraints:
- Video Section: Fixed height
- Metrics: Scroll
- Actions: Bottom
```

---

## 六、交互原型 (Prototype)

### 6.1 页面切换

```
Transition:
- Type: Move In
- Direction: From Right
- Animation: Ease Out
- Duration: 300ms
```

### 6.2 按钮交互

```
On Tap:
- Scale: 0.98
- Duration: 150ms
- Ease: Ease In Out

On Hover (Desktop):
- Scale: 1.02
- Shadow: Shadow/Color
- Duration: 200ms
```

### 6.3 卡片交互

```
On Hover:
- Y: -4px
- Shadow: Shadow/Lg
- Duration: 200ms
- Ease: Ease Out
```

### 6.4 数字动画

```
On Load:
- Type: Number Counter
- From: 0
- To: Target Value
- Duration: 500ms
- Ease: Ease Out
```

---

## 七、资源导出

### 7.1 导出设置

```
Formats:
- Icons: SVG
- Images: PNG @2x, @3x
- Screenshots: PNG @1x

Naming:
- ic-{name}.svg
- img-{name}@2x.png
- screen-{name}.png
```

### 7.2 设计交付清单

- [ ] Color Styles (所有颜色)
- [ ] Text Styles (所有文本)
- [ ] Effect Styles (所有效果)
- [ ] Components (所有组件 + 状态)
- [ ] Page Templates (所有页面)
- [ ] Prototype (所有交互)
- [ ] Export Assets (所有资源)

---

## 八、Figma 文件结构

```
PingPong AI Design/
├── 📄 Cover (封面)
├── 🎨 Foundations/
│   ├── Colors (颜色)
│   ├── Typography (字体)
│   ├── Effects (效果)
│   └── Grids (网格)
├── 🧩 Components/
│   ├── Buttons (按钮)
│   ├── Cards (卡片)
│   ├── Inputs (输入)
│   ├── Navigation (导航)
│   ├── Data Display (数据)
│   └── Feedback (反馈)
├── 📱 Pages/
│   ├── Home (首页)
│   ├── Upload (上传)
│   ├── Result (结果)
│   ├── Compare (对比)
│   ├── Standard Actions (标准动作)
│   ├── Realtime (实时)
│   ├── Profile (个人)
│   └── Settings (设置)
└── 🎬 Prototype (交互原型)
```

---

**使用说明**:

1. 在 Figma 中创建新文件
2. 按上述结构创建 Pages
3. 复制 Color/Text/Effect Styles
4. 创建 Components 并添加 Variants
5. 搭建 Page Templates
6. 添加 Prototype 交互
7. 导出 Assets

**预计时间**: 3-4 小时（熟练设计师）
