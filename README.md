# 地球觀測站 (Planet Earth Observatory) 🌍

一個優雅、現代且具互動性的地球展示網頁，呈現在浩瀚宇宙深空中的蔚藍母星。

## 🌟 核心特色

- **高解析度真實地球影像**：細緻展現陸地、深藍海洋、漩渦狀白色雲層與邊緣大氣層。
- **動態星空背景 (Canvas Starfield)**：依視窗尺寸動態生成的夜空恆星與自然閃爍微光。
- **3D 視差傾斜反應 (Parallax Tilt)**：游標懸停隨動呈現三維行星立體懸浮感。
- **地表重要地標熱點 (Interactive Hotspots)**：點擊探索撒哈拉沙漠、地中海、剛果雨林、大西洋氣象渦旋與大氣層邊緣等地理特徵。
- **多光譜濾鏡切換**：
  - 真彩光學 (Natural)
  - 大氣藍光 (Aura)
  - 深空高對比 (Deep Space)
  - 海洋光譜 (Oceanic)
- **行星遙測數據儀表板 (Planetary Telemetry)**：直觀呈現地球赤道直徑、軌道速度、水陸比例、大氣組成、表面均溫與人口數據。
- **高倍率檢視模式 (Inspection Loupe)**：支援滑鼠滾輪縮放 (0.75x ~ 5x) 與拖曳平移檢視。
- **深空環境音合成器 (Cosmic Ambient Soundscape)**：利用 Web Audio API 原生合成平靜沉穩的深空低頻無調性氛圍音，無需額外下載龐大音訊檔。
- **經典人文引言**：收錄卡爾·薩根 (Carl Sagan) 《暗淡藍點》(Pale Blue Dot) 中英對照經典名言。

## 🚀 運行方式

直接使用任何現代瀏覽器開啟 `index.html` 即可：

```bash
# 使用 Python 內建伺服器預覽
python3 -m http.server 8080

# 或使用 Node.js npx serve
npx serve .
```

## 📁 檔案結構

```
.
├── index.html       # 語意化 HTML5 主頁面結構
├── style.css        # 純 Vanilla CSS 設計系統與動態動畫
├── app.js           # 互動邏輯、Canvas 動畫與 Web Audio 合成器
├── assets/
│   └── earth.jpg    # 高解析度地球寫實照片
└── README.md        # 專案說明文件
```
