# 🧠 NeuroReqs – Smart Requirements Classification System

> A web-based AI-powered tool for classifying, analyzing, and exporting software requirements — instantly, privately, and intelligently.

🌐 **Live Demo:** [neuroreqs.netlify.app](https://neuroreqs.netlify.app)

---

## 📋 Overview

Traditional requirements classification is time-consuming, inconsistent, and dependent on domain expertise. NeuroReqs addresses this through intelligent automation — using pattern recognition and machine learning to classify natural language requirements in real time.

The system processes requirements as functional or non-functional, evaluates their quality, generates UML diagrams and user stories, and exports results to popular development tools — all client-side, with no server involved, ensuring complete data privacy.

---

## ✨ Features

### 🔐 Authentication & User Management
- Secure account creation and login
- User profile with role, statistics, and preferences
- Session management with auto-expiration

### 📂 Project Management
- Create and manage multiple projects (Agile, Waterfall, Custom templates)
- Project Hub with search, edit, and delete capabilities

### 📥 Requirement Input
Three input modes supported:
- **Text** – Type requirements manually, one per line
- **Speech** – Use the Web Speech API to dictate requirements
- **Samples** – Load prebuilt functional, non-functional, or mixed requirement sets

### 🤖 Classification Engine
- Dual-layer approach: Pattern Matching + ML-based confidence scoring
- Classifies requirements as Functional or Non-Functional
- Assigns subcategories: authentication, performance, security, compatibility, etc.
- Confidence score displayed per requirement

### 📊 Quality Analysis
Each requirement is scored out of 10 across three dimensions:

| Criterion | Points | What's Checked |
|-----------|--------|----------------|
| Clarity | 5 | Ambiguity, clear language |
| Testability | 3 | Measurable criteria, verifiable statements |
| Completeness | 2 | Required components, proper structure |

Issues are flagged and improvement suggestions are generated automatically.

### 📐 Model Generation
- **UML Class Diagram** – Extracts entities and relationships from functional requirements, rendered in PlantUML syntax
- **User Stories** – Auto-formats requirements as "As a... I want... So that..." stories

### 📤 Export & Integration Hub
| Format | Description |
|--------|-------------|
| Jira | Export as issues with proper categorization |
| Trello | Generate cards from user stories |
| PDF Report | Full executive summary |
| JSON | Structured raw data for external processing |

- Live preview before exporting
- Compliance report and standards checker
- Audit log of all system activity

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Language | JavaScript (ES6+) |
| Markup | HTML5 |
| Styling | CSS3, Bootstrap 5.3.0 |
| Charts | Chart.js 3.9.1 |
| Speech Input | Web Speech API |
| Storage | LocalStorage API |
| Export | File API |
| Icons | Font Awesome 6.4.0 |
| Fonts | Google Fonts (Inter, Poppins) |
| Hosting | Netlify |

---

## 🏗️ Architecture

The system is entirely client-side with no backend server:

```
User Browser
└── Client-Side Application (JavaScript Modules)
    ├── Classification Engine  → Pattern matching + ML confidence scoring
    ├── Chart.js Visualizations → Requirements distribution, quality charts
    ├── Web Speech API         → Voice input
    ├── LocalStorage           → Encrypted session & project data
    └── Export Generator       → Jira, Trello, PDF, JSON outputs
```

### Key Classes

| Class | Responsibility |
|-------|---------------|
| `RequirementsClassifier` | Orchestrates the full classification pipeline |
| `PatternMatcher` | Regex-based functional/non-functional detection |
| `QualityAnalyzer` | Scores and flags issues in each requirement |
| `ExportManager` | Generates JSON, Jira, Trello, and PDF outputs |
| `ChartManager` | Renders analytics visualizations |
| `UIManager` | Handles step navigation and loading states |

---

## 🔄 How It Works

```
User inputs text
      ↓
   ENTERED → Parse requirements
      ↓
   PARSED → Run classification engine
      ↓
  CLASSIFIED → Analyze quality (clarity, testability, completeness)
      ↓
QUALITY_CHECKED → [User may edit/re-process → REVISED]
      ↓
  VISUALIZED → Generate UML + user stories
      ↓
MODELS_GENERATED → Prepare exports
      ↓
 EXPORT_READY → Download complete
```

---

## 🔒 Security & Privacy

- **Local Processing** – All classification runs in the browser; no data leaves your device
- **Encrypted Storage** – User data is encrypted in LocalStorage
- **Session Management** – Automatic expiration, no server-side storage
- **Audit Logging** – Every action is tracked in a viewable audit trail

---

## 📁 Project Structure

```
NeuroReqs-RCS/
├── index.html    # Full application UI and structure
├── script.js     # Classification engine, ML logic, export handlers
├── styles.css    # Custom styling and responsive layout
└── README.md
```

---

## 📐 Standards & References

- IEEE Std 830-1998 – Recommended Practice for Software Requirements Specifications
- ISO/IEC 25010:2011 – Systems and Software Quality Requirements and Evaluation
- WCAG 2.1 – Web Content Accessibility Guidelines

---

## 🔮 Future Improvements

- Backend integration for persistent multi-device storage
- Collaborative project editing (multi-user)
- Fine-tuned ML model trained on real requirements datasets
- Direct Jira/Trello API push (OAuth integration)
- Requirement traceability matrix generation
- Dark mode support

---

## 📄 License

This project was developed for academic purposes as part of the BSE curriculum at Bahria University Karachi Campus. Not intended for production use.

---

*© 2025 NeuroReqs • Smart Requirements Classification and Analysis Project by Muhammad Shayan Shakeel*
