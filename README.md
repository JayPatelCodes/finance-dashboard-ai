# FinAI — Personal Finance Dashboard

A full-stack personal finance dashboard where users can upload transaction CSV files, automatically categorize spending, and chat with a Gemini-powered assistant about their finances.

---

## Table of Contents

1. [Description](#description)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Installation](#installation)
5. [Usage](#usage)
6. [Demo Video](#demo-video)

---

## Description

FinAI lets users securely sign up, upload their bank transaction CSVs, and instantly see their spending broken down by category, trend, and forecast. A built-in chatbot powered by Gemini answers natural language questions about their finances. For example, things like spending breakdowns, top categories, and monthly comparisons are shown. Each user's data is fully isolated behind JWT authentication.

---

## Features

- Secure sign up and login with email/password or Google OAuth
- Upload transaction CSV files with automatic duplicate detection
- Automatic expense categorization using Gemini
- Interactive charts: spending by category, daily trends, and a 30-day forecast
- Month-by-month navigation to browse historical data
- Conversational finance assistant powered by Gemini 2.5 Flash
- Clear all data with one click

---

## Tech Stack

**Frontend**
- React + TypeScript
- Vite
- Recharts
- Axios

**Backend**
- FastAPI
- MongoDB + Motor (async)
- Pandas + scikit-learn
- Gemini API (categorization + chatbot)
- JWT authentication via python-jose

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/JayPatelCodes/finance-dashboard-ai.git
cd finance-dashboard-ai
```

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
MONGO_URI=mongodb://localhost:27017
MONGODB_DB=finance_ai_dashboard
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_random_secret_string_here
GOOGLE_CLIENT_ID=        # optional, for Google OAuth
CORS_ORIGINS=http://localhost:5173
```

Start the backend:

```bash
uvicorn main:app --reload
```

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=   # optional, for Google OAuth
```

---

## Usage

1. Open [http://localhost:5173](http://localhost:5173) in your browser.
2. Create an account or sign in.
3. Upload a `.csv` file with columns: `Date`, `Description`, `Amount`.
4. Browse your categorized transactions, charts, and spending insights.
5. Use the month selector in the sidebar to view specific months.
6. Ask the chatbot questions like:
   - "How much did I spend on dining this month?"
   - "What's my biggest expense category?"
   - "Am I spending more than I earn?"

---

## Demo Video

Coming soon.