# Document Vision Analyzer

## 📋 Quick Summary

> 🔍 **Document Vision Analyzer** 是一款 AI 驅動的文件視覺分析工具，超越傳統 OCR 的純文字擷取，提供三種智慧分析模式。📝 **OCR 模式**精確提取圖片中的所有文字；🖼️ **描述模式**生成文件的自然語言視覺描述；❓ **分析模式**支援針對文件內容的開放式問答。🔒 最大亮點：所有推理完全在本地執行！採用 Ollama 視覺模型（glm-ocr），無需雲端 API、數據不離開你的網路、零額外費用。⚡ 基於 Next.js 16 App Router 構建，搭配拖放上傳、即時預覽、推理進度指示器及一鍵複製功能。🌙 深色極簡 UI 設計，專為專注的文件工作場景優化。🎯 適合處理收據、截圖、手寫筆記、街頭標誌等各類圖像的文字識別與語義理解，是注重隱私與離線使用的文件分析利器！

**AI-Powered OCR, Visual Description, and Semantic Analysis -- Beyond Text Extraction**

---

## 💡 Why This Exists

Traditional OCR tools extract text and stop there. This project goes further -- it provides three distinct modes of document intelligence: precise text extraction (OCR), rich visual description (what does the document look like and contain), and open-ended semantic analysis (ask any question about the document). Powered by a local Ollama vision model, all processing stays on your machine. No cloud APIs, no data leaving your network, no per-request costs.

## 🏗️ Architecture

```
User uploads image (document, screenshot, sign, handwriting, photo)
        |
        v
+-----------------------------------------------------+
|  Next.js App Router                                   |
|                                                       |
|  Client (app/page.tsx)                                |
|    - Drag-and-drop upload with live preview           |
|    - Mode tabs: OCR | Describe | Analyze              |
|    - Progress indicator during inference               |
|    - One-click copy to clipboard                       |
|                                                       |
|  Server API Route (app/api/vision/route.ts)           |
|    - Receives image + mode + optional custom prompt    |
|    - Converts to base64                                |
|    - Routes to Ollama vision model                     |
|    - Returns structured result                         |
+-----------------------------------------------------+
        |
        v
  Ollama (local inference, glm-ocr model)
        |
        v
  Text / Description / Answer
```

### Three Modes of Intelligence

| Mode | What It Does | Example |
|---|---|---|
| **OCR** | Extracts all text from the image | Receipts, screenshots, handwritten notes, street signs |
| **Describe** | Generates a detailed natural-language description | "A two-column document with a header logo, three data tables, and a signature at the bottom" |
| **Analyze** | Answers a specific question about the image | "How many people are in this photo?" / "What brand is the laptop?" / "Is this document signed?" |

### Key Capabilities

- **100% local inference** -- Ollama runs on your machine, no data leaves your network
- **Three analysis modes** with seamless tab switching in a unified interface
- **Drag-and-drop upload** with instant image preview
- **Custom prompting** in Analyze mode for targeted question-answering
- **Progress indicator** with animated feedback during model inference
- **One-click clipboard copy** for all results
- **Dark, minimal UI** designed for focused document work

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Components) |
| AI Inference | Ollama (local, glm-ocr vision model) |
| Styling | Tailwind CSS |
| Language | TypeScript |
| Runtime | Node.js (API routes with server-side processing) |

## 🏁 Quick Start

```bash
# 1. Install and start Ollama with a vision model
ollama pull glm-ocr

# 2. Install project dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) -- upload any image and select a mode.

> **Prerequisite:** [Ollama](https://ollama.com/) must be installed and running locally. The `glm-ocr` model (or any Ollama vision-capable model) must be pulled before first use.

## 📁 Project Structure

```
document-vision-analyzer/
  app/
    page.tsx                     # Main UI -- upload, mode selection, results display
    layout.tsx                   # Root layout with metadata
    globals.css                  # Global styles (dark theme)
    api/
      vision/
        route.ts                 # Core API -- handles OCR, describe, and analyze modes
      ocr/
        route.ts                 # Dedicated OCR endpoint
  public/                        # Static assets
  next.config.ts                 # Next.js configuration
  package.json                   # Dependencies (next, ollama, react)
  tsconfig.json                  # TypeScript configuration
```

---

Built by [Huang Akai (Kai)](https://github.com/akaihuang) -- Creative Technologist, Founder @ Universal FAW Labs
