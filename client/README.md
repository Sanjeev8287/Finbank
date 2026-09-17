# FinBank — Digital Banking & Relationship Manager Portal

A full-stack digital banking simulation platform with separate Customer and Relationship Manager portals, AI-powered banking assistance, RAG-based policy knowledge, tool calling, role-based access control, and security-focused backend architecture.

> **Note:** FinBank is a portfolio/demo project. It does not process real money, real banking credentials, real OTPs, CVVs, or financial transactions.

---

## 🚀 Project Overview

FinBank simulates a modern digital banking ecosystem with two separate portals:

### Customer Portal

- Secure customer login
- Dashboard and financial overview
- Account management
- Card information
- Loan information
- Transaction history
- Service request management
- Customer profile
- AI banking assistant

### Relationship Manager Portal

- Secure RM login
- Customer search
- Customer 360 view
- Customer accounts, cards and loans
- Customer transaction history
- Service request management
- Customer activity and audit information
- AI assistant for customer insights

---

## ✨ Key Features

### 👤 Customer Management

- Customer authentication
- Customer profile
- Customer dashboard
- Financial overview
- Customer-specific banking data
- Service request tracking

### 💳 Banking Modules

**Accounts**
- Account details
- Account type
- Branch and IFSC information
- Balance
- Account status

**Cards**
- Card type and variant
- Masked card information
- Credit limit
- Available limit
- Expiry information
- Card status

**Loans**
- Loan type
- Principal amount
- Outstanding amount
- Interest rate
- EMI amount
- Next EMI date
- Loan tenure
- Loan status

**Transactions**
- Transaction reference
- Transaction type
- Category
- Description
- Amount
- Transaction date
- Transaction status

**Service Requests**
- Request number
- Request type
- Subject and description
- Priority
- Status
- Created and updated dates

---

## 🤖 AI Banking Assistant

FinBank includes AI-powered banking assistance for both customers and Relationship Managers.

### Customer AI

The customer assistant can provide insights such as:

- Total outstanding loan
- Monthly spending
- Credit utilization
- Financial summaries
- Banking information explanations

### RM AI

The RM assistant can help with operational insights such as:

- Customers with EMI due soon
- Customers with high credit utilization
- Customer information lookup
- Customer financial summaries

---

## 🧠 AI Tool Calling

The RM AI assistant supports LLM tool/function calling.

Instead of allowing the LLM to directly access the database, controlled backend tools are used.

```text
RM User
   │
   ▼
AI Assistant
   │
   ▼
LLM
   │
   ├── Tool Request
   ▼
Backend Tool
   │
   ▼
PostgreSQL
   │
   ▼
Tool Result
   │
   ▼
LLM
   │
   ▼
Final Response
This keeps database access controlled by the backend application.
The AI does not directly perform sensitive banking operations such as money transfers, loan approval/rejection, or credit-limit changes.

📚 RAG — Retrieval Augmented Generation
FinBank uses Retrieval Augmented Generation for banking policies and documentation.
Banking Policy Documents
          │
          ▼
   Document Retrieval
          │
          ▼
    Relevant Context
          │
          ▼
          LLM
          │
          ▼
    Grounded Response
RAG allows the AI assistant to use relevant banking policy information when generating responses.

🔐 Security

Security has been incorporated at the backend and API levels.
Authentication
JWT-based authentication
Protected API routes
Server-side token verification
Authorization
Role-based access control for:
CUSTOMER
RM
SENIOR_RM
ADMIN
Additional Security Measures
Input validation
API rate limiting
Security headers
CORS configuration
Audit/activity logging
Sensitive data masking
Protected backend routes
Controlled AI tool access

🏗️ System Architecture

                         ┌──────────────────────┐
                         │      User Browser     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   React + TypeScript │
                         │      Frontend        │
                         └──────────┬───────────┘
                                    │
                              REST API / JWT
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Node.js + Express  │
                         │      Backend         │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
      ┌───────────────┐    ┌────────────────┐    ┌───────────────┐
      │ Authentication│    │ Banking APIs   │    │ Security /    │
      │ & RBAC        │    │ Accounts       │    │ Audit Logs    │
      │               │    │ Cards          │    │               │
      │               │    │ Loans          │    │               │
      └───────────────┘    │ Transactions   │    └───────────────┘
                           │ Service Request│
                           └───────┬────────┘
                                   │
                                   ▼
                         ┌──────────────────────┐
                         │     PostgreSQL       │
                         │       Database       │
                         └──────────────────────┘


                    AI / RAG Architecture
                              │
                              ▼
                    ┌──────────────────────┐
                    │   Python AI Service  │
                    │      FastAPI         │
                    └──────────┬───────────┘
                               │
                               ▼
                         ┌─────────────┐
                         │    Groq     │
                         │     LLM     │
                         └──────┬──────┘
                                │
                         Tool Calling
                                │
                                ▼
                         Backend Tools
                                │
                                ▼
                           PostgreSQL

                    RAG
                     │
                     ▼
              Banking Documents
                     │
                     ▼
                Retrieval
                     │
                     ▼
                   LLM

🛠️ Tech Stack

Frontend
React
TypeScript
Vite
React Router
Axios
Recharts
React Hook Form
Zod
CSS / Tailwind CSS
Backend
Node.js
Express.js
PostgreSQL
JWT Authentication
REST APIs
AI
Python
FastAPI
LLM
Groq API
OpenAI-compatible Python SDK
Tool Calling
RAG
Development Tools
VS Code
Git
GitHub
Postman

📁 Project Structure

FinBank/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── db.js
│   ├── index.js
│   └── package.json
│
├── ai-service/
│   ├── main.py
│   ├── ai.py
│   ├── tools/
│   ├── rag/
│   └── requirements.txt
│
├── database/
│   └── SQL / database scripts
│
├── docs/
│   ├── architecture/
│   └── banking-policies/
│
├── .env.example
├── .gitignore
└── README.md

▶️ Running the Project Locally

1. Clone Repository
git clone YOUR_GITHUB_REPOSITORY_URL
cd FinBank
2. Backend Setup
cd server
npm install
npm start
Backend:
http://localhost:5000
Create the required .env file using .env.example.
3. Frontend Setup
Open another terminal:
cd client
npm install
npm run dev
Frontend:
http://localhost:5173
4. AI Service Setup
Open another terminal:
cd ai-service
python -m venv venv
Activate the virtual environment on Windows:
.\venv\Scripts\Activate.ps1
Install dependencies:
pip install -r requirements.txt
Start the AI service:
uvicorn main:app --reload --port 8000
AI service:
http://localhost:8000

👨‍💻 Author
Sanjeev Singh
MCA | Full-Stack Developer | AI/LLM Enthusiast

⚠️ Disclaimer
FinBank is an educational and portfolio project.
It is a banking simulation and is not intended for real financial transactions or production banking use.
No real customer banking credentials, card details, OTPs, CVVs, or payment information should be used with this project.