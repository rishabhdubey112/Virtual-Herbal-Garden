# 🌱 Virtual Herbal Garden

A comprehensive, full-stack Artificial Intelligence-powered web application designed for exploring, identifying, and purchasing medicinal plants. This project blends traditional Ayurvedic knowledge with cutting-edge AI technologies to provide users with a smart, interactive, and beautifully designed digital garden experience.

## ✨ Key Features

* 🌿 **AI Plant Identifier** 
  * Powered by **LLaMA 3.2 Vision** and **NVIDIA Nemotron-70b**.
  * Upload a real plant image or type a common name, and the AI will analyze it to provide scientific names, confidence scores, medicinal benefits, and growing seasons.
* 👨‍⚕️ **AI Ayurvedic Doctor (Consultation)**
  * Input your symptoms, and the AI doctor cross-references our local database to recommend the best herbal remedies and exact plants available in the store.
* 🛒 **E-Commerce & Digital Shopping Cart**
  * Seamless cart management and checkout flow with options for **Credit/Debit Card, UPI, and Cash on Delivery (COD)**.
* 🪴 **My Digital Garden (Plant Tracker)**
  * A personalized dashboard reflecting your order history.
  * Interactive tracking system allowing users to log when they "Watered" their purchased plants.
* ⭐ **Community Review System**
  * 5-star rating and comment system for all plants, allowing users to share their experiences.
* 🛠️ **Admin Panel**
  * Manage inventory seamlessly. Add, edit, or delete plant entries and update the database graphically.

---

## 🛠️ Technology Stack

* **Frontend:** React.js (Vite), Modern Vanilla CSS (Glassmorphism & Gradients)
* **Backend:** Python, Flask, Flask-CORS
* **Database:** SQLite (`herbal_garden.db` with automated migrations)
* **AI APIs:** OpenRouter (NVIDIA LLaMA / Nemotron)
* **Deployment Tools:** Vite Proxy, Localtunnel (for mobile display)

---

## 🚀 Running the Project Locally

To run this project on your machine, you need **Node.js (v16+)** and **Python (v3.8+)** installed.

### 1. Set Up Environment Variables (API Keys)
In the `backend` folder, create a file named `.env` and add your OpenRouter API key:
```env
NVIDIA_API_KEY=your_openrouter_api_key_here
```

### 2. Setting up the Backend (Flask)
Open a terminal and execute the following:
```bash
cd backend
pip install -r requirements.txt
python app.py
```
*The Flask server will start on `http://localhost:5000`.*

### 3. Setting up the Frontend (React)
Open a **new** terminal and execute:
```bash
cd frontend
npm install
npm run dev
```
*The Vite development server will start. Open your browser and go to `http://localhost:5173`.*

---

## 📱 Presenting on Mobile (Web-to-APK Method)

If you need to showcase this project to clients or college professors on a mobile phone without physically copying files or using Android Studio, follow this "LocalTunnel" method:

1. Ensure both the Flask and React servers are running on your laptop.
2. The frontend code is already configured to automatically proxy `/api` requests to the local backend.
3. In a new terminal, run: 
   ```bash
   npx localtunnel --port 5173
   ```
4. Copy the generated `loca.lt` link.
5. Search for a free "Web-to-APK Converter" online (e.g., *webintoapp.com*).
6. Paste your `loca.lt` link, generate the `.apk`, and install it on your mobile device.  
*(Note: Your laptop must remain ON with servers running during the mobile presentation).*

---

## 📂 Project Structure

```
virtual-herbal-garden/
├── backend/
│   ├── app.py                  # Main Flask Server & API routes
│   ├── model.py                # AI Integration (Vision & Text)
│   ├── database.py             # SQLite setup and migrations
│   ├── .env                    # API keys
│   └── herbal_garden.db        # Database File
└── frontend/
    ├── src/
    │   ├── App.jsx             # React Router Setup
    │   ├── pages/              # Home, Identify, Consult, Cart, PlantDetails, Login
    │   ├── components/         # Navbar, UploadPlant
    │   └── index.css           # Global Styling & Glassmorphism
    ├── package.json
    └── vite.config.js          # API Proxy settings
```

---

## 🔐 Future Enhancements
* Multi-language support (Hindi / Regional languages).
* Advanced user authentication (Firebase/OAuth integration).
* Dark Mode toggle.
