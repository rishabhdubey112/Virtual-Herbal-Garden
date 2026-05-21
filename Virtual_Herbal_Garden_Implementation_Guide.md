# Virtual Herbal Garden - Complete Implementation & Setup Guide

This document contains the complete implementation details, architecture, and step-by-step setup guide for the **Virtual Herbal Garden** application. 

---

## 🏗️ 1. Project Architecture & Tech Stack

The application is divided into two decoupled architectures: a **React.js Frontend** and a **Python Flask Backend**.

### Frontend (User Interface)
* **Framework:** React.js (via Vite for lightning-fast bundling)
* **Styling:** Custom CSS with Glassmorphism ("Miracle UI"), CSS Animations, SVG Graphics
* **Routing:** `react-router-dom` (Home, Identify, PlantDetails)
* **Icons:** `lucide-react`
* **Native Web APIs Used:**
  * `navigator.mediaDevices.getUserMedia` (For Real-Time Camera / AR Scanner)
  * `window.SpeechRecognition` (For Voice-to-Text searching)

### Backend (AI & Database)
* **Framework:** Python Flask
* **Database:** SQLite3 (`herbal_garden.db`)
* **AI Provider:** OpenRouter API (OpenAI-compatible endpoints)
  * **Vision Model:** `meta-llama/llama-3.2-11b-vision-instruct` (Analyzes plant images)
  * **Text Model:** `nvidia/llama-3.1-nemotron-70b-instruct` (Analyzes text/voice descriptions)
* **Core Libraries:** `flask-cors`, `requests`, `python-dotenv`

---

## 🌟 2. Core Features Implemented

1. **AI Plant Identification:** Upload images, use the live device camera, or speak/describe a plant. The AI instantly identifies it, retrieves its scientific name, medicinal benefits, and habitat.
2. **Auto-Discovery Library:** If the AI identifies a new medicinal plant not currently in your database, it automatically generates a permanent SQLite database entry and saves your captured photo locally to expand your digital garden!
3. **Miracle UI (Glassmorphic Hologram):** A state-of-the-art dark-glass interface with neon green (`#00FF87`) scanning lasers, pulsating glowing borders, and incredibly smooth micro-interactions.
4. **Offline Resilience:** Auto-generated dynamic SVG illustrations are synthesized locally via Python for plants that suffer from external rate-limits (like Wikipedia or Unsplash).
5. **False-Positive Rejection:** The system is strictly prompted to reject non-botanical images (e.g., cars, monitors, dogs) with custom error handling.

---

## 🚀 3. Step-by-Step VS Code Setup Guide

Follow these exact steps to run the application on any local machine.

### Prerequisites (Install these first)
- [Node.js](https://nodejs.org/) (Version 18+ recommended)
- [Python](https://www.python.org/downloads/) (Version 3.10+ recommended, check "Add to PATH" during install)
- [Visual Studio Code](https://code.visualstudio.com/)

### Step A: Opening the Project
1. Open Visual Studio Code.
2. Go to `File > Open Folder...` and select the `virtual-herbal-garden` main folder.

### Step B: Setting up the Python Backend
1. Open a Terminal in VS Code (`Ctrl + ~` or `Terminal -> New Terminal`).
2. Navigate into the backend folder:
   ```bash
   cd backend
   ```
3. Create an isolated Virtual Environment so global packages don't conflict:
   ```bash
   python -m venv venv
   ```
4. Activate the Virtual Environment:
   * **Windows:** `venv\Scripts\activate`
   * **Mac/Linux:** `source venv/bin/activate`
5. Install the required Python libraries:
   ```bash
   pip install -r requirements.txt
   ```
6. Set up your OpenRouter AI Key:
   * Create a file named `.env` inside the `backend` folder.
   * Add the following text to it:
     ```env
     OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
     ```
7. Start the Backend Server:
   ```bash
   python app.py
   ```
   *(Keep this terminal open! The backend is now actively listening on `http://127.0.0.1:5000`)*

### Step C: Setting up the React Frontend
1. Open a **Second Terminal** in VS Code (Click the `+` icon in the terminal panel).
2. Navigate into the frontend folder:
   ```bash
   cd frontend
   ```
3. Install all Node modules and React dependencies:
   ```bash
   npm install
   ```
4. Start the Vite Development Server:
   ```bash
   npm run dev
   ```
5. **Launch the App:** Hold `Ctrl` and click the local link generated in the terminal (usually `http://localhost:5173/`).

---

## 🛡️ 4. Handling Common Errors
* **`Cannot connect to backend on port 5000`:** This means your first terminal (running `python app.py`) has crashed or isn't running. Go to that terminal and restart the command.
* **`Microphone / Camera not Working`:** Browsers block camera/mic access on domains without `https://`. However, `localhost` (127.0.0.1) is perfectly whitelisted. Ensure you click "Allow" when the browser prompts you for permission.
* **`Rate Limit / 429 Errors for Images`:** We have bypassed this by serving beautiful `<svg>` graphics and direct Wikipedia Commons files via Python generator scripts. No configurations needed!

---
*(End of Implementation Document)*
