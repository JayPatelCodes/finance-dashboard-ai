# AI Finance Dashboard (FastAPI + React + TypeScript + MongoDB)

A full-stack AI-powered finance dashboard that helps users upload, categorize, and analyze transactions. Built with a React + TypeScript frontend and a FastAPI backend, the app features **AI-driven categorization**, **interactive insights**, and a **DeepSeek-powered chatbot** for personalized financial Q&A.

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

The AI Finance Dashboard enables users to securely upload transaction CSV files, automatically categorize spending, and view interactive insights. A built-in chatbot, powered by **DeepSeek LLM**, allows users to ask natural language questions about their finances, from spending breakdowns to monthly trends, for a more personalized experience.

---

## Features

- Upload and parse transaction **CSV files**  
- **AI-powered categorization** of expenses using text classification  
- Interactive dashboard with **insights, charts, and forecasts**  
- **DeepSeek chatbot** for conversational finance queries  
- Fast, responsive **React + Vite frontend**  
- Scalable backend with **FastAPI + MongoDB**  

---

## Tech Stack

**Frontend**
- React  
- TypeScript  
- Vite  
- Axios  

**Backend**
- FastAPI  
- Python  
- MongoDB  
- Pandas  
- DeepSeek API  

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/JayPatelCodes/ai-finance-dashboard.git
cd ai-finance-dashboard
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file inside the root of `backend` folder:

```env
MONGO_URI=mongodb://localhost:27017/finance
MONGODB_DB=finance_ai_dashboard
DEEPSEEK_API_KEY=your-deepseek-api-key
```

Start the FastAPI backend:

```bash
uvicorn main:app --reload
```

### 3. Frontend Setup

Open a new terminal window/tab:

```bash
cd frontend
npm install
npm run dev
```

---

## Usage

1. Open [http://localhost:5173](http://localhost:5173) in your browser.  
2. Upload a `.csv` file with transactions.  
3. View **categorized transactions** in the dashboard.  
4. Explore **charts and insights** generated from spending patterns.  
5. Ask the **DeepSeek chatbot** questions like:  
   - “What’s my biggest expense this month?”  
   - “How much did I spend on food last week?”  
   - “Show me trends in entertainment spending.”  

---

## Demo Video

This or a live demo link will be uploaded soon after some small changes are added to the project. Thank you!
