# FinAI — Personal Finance Dashboard

A full-stack personal finance dashboard where users can upload bank transaction CSVs, automatically categorize spending with AI, and chat with a Gemini-powered assistant about their finances.

---

## Table of Contents

1. [Description](#description)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Installation](#installation)
5. [Usage](#usage)
6. [Security](#security)
7. [Demo Video](#demo-video)

---

## Description

FinAI lets users securely sign up, upload their bank transaction CSVs, and instantly see their spending broken down by category, trend, and 30-day forecast. Transactions are categorized automatically using a single batched Gemini API call. A built-in chatbot answers natural language questions about spending patterns, top categories, and monthly comparisons. Each user's data is fully isolated behind JWT authentication, and categories can be corrected inline if the AI gets one wrong.

---


## Security

A red-team security assessment was conducted against a live instance of the application, covering prompt injection, brute-force authentication, JWT forgery, cross-user data access, session management, and input validation. 11 attacks were executed with 5 confirmed findings.

[View the full report](./FinAI_RedTeam_Report.pdf)

---

## Features

- Secure sign up and login with email/password or Google OAuth
- Upload transaction CSV files with duplicate detection and a 5MB size limit
- Automatic expense categorization using Gemini 2.5 Flash (batch call, no local model)
- Inline category editing directly in the transaction table
- Interactive charts: spending by category (donut), daily trends (area), and 30-day forecast
- Month-by-month navigation with a year picker for historical data
- Budget goals per category with progress bars (persistent or month-specific)
- Recurring transaction detection across your history
- Conversational finance assistant powered by Gemini 2.5 Flash
- Search, filter by category, and export filtered transactions to CSV
- Multi-page layout with collapsible sidebar navigation
- Clear all data from the Settings page

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
3. Upload a `.csv` file with columns: `Date`, `Description`, `Amount`. Amounts should be negative for expenses and positive for income.
4. Browse your categorized transactions, charts, and spending insights on the Dashboard.
5. Use the month navigator at the top to switch between months, or click the month name to open a year picker.
6. Click any category badge in the transaction table to edit it inline.
7. Set budget limits per category on the Budgets page.
8. View recurring transactions detected across your history on the Recurring page.
9. Ask the chatbot questions like:
   - "How much did I spend on dining this month?"
   - "What is my biggest expense category?"
   - "Am I spending more than I earn?"

---

## Demo Video

Coming soon.