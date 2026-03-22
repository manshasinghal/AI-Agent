# 🤖 AI Planning Agent with Editable Report Export

A full-stack **Next.js application** that uses a **multi-agent AI workflow** to generate structured execution plans from user problems, allows **AI-powered section editing**, and supports **export to DOCX & PDF**.

---

## 🚀 Live Demo

https://ai-agent-wlzg.vercel.app/

---


## 🧠 Core Features

### 1️⃣ Multi-Agent AI Workflow (Agentic Design)

Instead of a single prompt, this system uses **3 distinct AI agents**:

* **Planner Agent**

  * Breaks down the problem into components
  * Identifies stakeholders

* **Insight Agent**

  * Adds reasoning, risks, and context
  * Enhances depth of the plan

* **Execution Agent**

  * Generates a structured, professional report

👉 This ensures **modular reasoning and better output quality**

---

### 2️⃣ Structured Report UI

The output is displayed in a clean, report-like format:

* Problem Breakdown
* Stakeholders
* Solution Approach
* Action Plan

✨ Designed with a modern UI (cards, sections, visual hierarchy)

---

### 3️⃣ AI-Powered Section Editing

Each section can be edited independently using AI:

Examples:

* “Make this more detailed”
* “Rewrite in a professional tone”
* “Shorten this section”

👉 Uses a dedicated **Editor Agent**
👉 Only the selected section is reprocessed (not the entire report)

---

### 4️⃣ Export Functionality

#### 📄 DOCX Export

* Proper headings
* Structured formatting
* Clean report layout

#### 📄 PDF Export

* Generated from UI
* Matches on-screen structure

---

### 5️⃣ Version History (Bonus)

* Each edit stores previous versions
* Undo functionality per section

---

### 6️⃣ Clean API Architecture

```
/api/agent/run     → Runs full agent pipeline
/api/agent/edit    → Edits individual sections
```

👉 Separation of concerns:

* Agent logic
* AI calls
* Export logic

---

## 🏗️ Tech Stack

### Frontend

* Next.js (App Router)
* React
* Tailwind CSS

### Backend

* Next.js API Routes

### AI

* OpenAI / OpenRouter (configurable)

### Export

* docx (DOCX generation)
* html2pdf.js (PDF export)

---

## 📁 Project Structure

```
/app
  /api
    /agent
      /run
      /edit
  /report

/lib
  /agents
    planner.ts
    insight.ts
    execution.ts
    editor.ts
  orchestrator.ts
  /export
    docx.ts
    pdf.ts
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repo

```bash
git clone https://github.com/your-username/ai-planner.git
cd ai-planner
```

---

### 2️⃣ Install dependencies

```bash
npm install
```

---

### 3️⃣ Add environment variables

Create `.env.local`:

```env
OPENAI_API_KEY=your_api_key
```

👉 Or use OpenRouter:

```env
OPENROUTER_API_KEY=your_key
```

---

### 4️⃣ Run locally

```bash
npm run dev
```

---

## 🔄 How It Works

1. User enters a problem
2. Request hits `/api/agent/run`
3. Orchestrator executes:

   * Planner → Insight → Execution
4. Structured report is generated
5. User can:

   * Edit sections via `/api/agent/edit`
   * Export as DOCX/PDF

---

## 🧪 Example Input

```
Build a creator marketplace platform
```

---

## 📤 Example Output

* Problem Breakdown
* Stakeholders
* Solution Approach
* Action Plan (structured tasks with timeline)

---

## 🎯 Key Design Decisions

* **Multi-agent architecture** for better reasoning
* **Section-level editing** instead of full regeneration
* **Structured JSON outputs** for reliable UI rendering
* **Client-side export** for performance and simplicity

---

## ⚠️ Challenges & Solutions

| Challenge                         | Solution                       |
| --------------------------------- | ------------------------------ |
| Inconsistent AI output            | Enforced strict JSON format    |
| Rendering nested objects          | Structured UI with mapping     |
| API failures                      | Added error handling + logging |
| Editing without full regeneration | Built dedicated editor agent   |

---

## 🚀 Future Improvements

* Streaming responses
* Report auto-save
* Version timeline UI
* Caching AI responses
* Better PDF styling

---

## 👨‍💻 Author

**Mansha Singhal**
Full Stack Developer (MERN + AI Systems)

---

## ⭐ If you like this project

Give it a ⭐ on GitHub!
