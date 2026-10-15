# AuraPrice AI — House Price Prediction Web Application

An end-to-end Machine Learning web application integrating `house_price_model_final.pkl` (GradientBoostingRegressor Pipeline) with a Python Flask API backend and a React + Vite frontend.

---

## Project Structure

```
house_price_predictor/
│
├── backend/
│   ├── app.py                      # Flask API & static web server
│   ├── house_price_model_final.pkl # Serialized Scikit-Learn ML Pipeline
│   ├── feature_defaults.json       # Precomputed Ames housing baseline defaults
│   ├── meta_info.json              # Neighborhoods, styles, and ranges metadata
│   └── requirements.txt            # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── App.jsx                 # Interactive House Valuation UI
    │   ├── index.css               # Modern glassmorphic design system
    │   └── main.jsx                # React root mount
    ├── dist/                       # Compiled production build
    ├── package.json
    └── index.html
```

---

## How to Run

### Option 1: Quick Single-Command Launch (Recommended)
You can run both the frontend and backend together on `http://localhost:5000` using the Python server:

```powershell
# From the backend folder:
cd backend
python app.py
```
Open **`http://localhost:5000`** in your browser.

---

### Option 2: Full Development Mode (Hot-Reload)
Run the backend and frontend simultaneously:

**Terminal 1 (Backend):**
```powershell
cd backend
python app.py
```

**Terminal 2 (Frontend Dev Server):**
```powershell
cd frontend
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## Features
- **Instant Model Inference:** Directly queries `house_price_model_final.pkl` with custom house configurations.
- **Pre-configured Benchmarks:** 1-Click presets for Luxury Estate, Suburban Family Home, Single-Story Ranch, and Cozy Starter Home.
- **Dynamic Property Controls:** Sliders and direct numerical inputs for Square Footage, Build Quality (1-10), Construction Year, Bedrooms, Bathrooms, Garage spaces, and Neighborhoods.
- **Detailed Analytics:** Visual price confidence corridor (95% to 105%), price per square foot estimation, and feature summaries.
