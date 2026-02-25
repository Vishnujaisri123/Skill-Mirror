# Skill Mirror: The Honesty Assessment Platform

**Know What You Actually Know.**

Skill Mirror is a modern, voice-first interview and assessment platform designed to bridge the gap between perceived confidence and actual technical competence. Unlike traditional multiple-choice tests, Skill Mirror uses AI-driven vocal interviews to assess depth of understanding and practical knowledge.

---

## 🌟 Key Features

### 🎙️ ChatGPT-Inspired Voice Mode
- **Immersive Interface:** A minimal, dark-themed UI with a central pulsating waveform that reacts to your voice.
- **Auto-Start Flow:** Select a skill and jump straight into the interview without friction.
- **Accurate Transcription:** Re-engineered speech-to-text logic that stabilizes long-form answers and prevents word dropout.
- **Subtle Feedback:** Real-time visual indicators show when the AI is "Thinking", "Speaking", or "Listening".

### 🧠 Adaptive AI Interviews
- **Difficulty Separation:** Strict boundaries between Beginner, Intermediate, and Advanced levels.
- **Zero Repetition:** A randomized "Sub-topic Strategy" ensures you never get the same questions twice.
- **Dynamic Scenarios:** The AI focuses on real-world niches like performance optimization, security, and architecture rather than textbook definitions.

### 📊 Confidence Mirror Analysis
- **Advanced Rubric:** Final scores are calculated using a strict technical rubric:
  - Technical Correctness (40%)
  - Depth of Understanding (40%)
  - Communication Clarity (20%)
- **Improvement Roadmap:** Direct, actionable plans based on your gaps and strengths.

---

## 🚀 Tech Stack

- **Frontend:** React + Vite, Vanilla CSS (Glassmorphism), Web Speech API.
- **Backend:** Node.js, Express, MongoDB.
- **AI Core:** Groq API (Llama-3.3-70b-versatile).

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- Groq API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Skill-Mirror
   ```

2. **Backend Setup:**
   ```bash
   cd skillmirror-backend
   npm install
   # Create a .env file with your GROQ_API_KEY
   npm start
   ```

3. **Frontend Setup:**
   ```bash
   # In the root folder
   npm install
   npm run dev
   ```

---

## 🤝 Collaboration

This project is a collaborative effort:
- **Frontend Development:** [Collaborator Name/Friend]
- **Backend & AI Logic:** [Your Name/User]

---

## 📄 License
This project is licensed under the MIT License.
