# Sanjeevani AI 🏥
**AI-Powered Healthcare Appointment & Clinic Assistant**

Sanjeevani AI is a production-quality SaaS platform designed as an intelligent AI receptionist for hospitals and clinics. It interacts with patients via Telegram, triages symptoms using Gemini AI, and provides a powerful admin dashboard for clinic management.
# Sanjeevani AI v2.0 🩺
AI-Powered Healthcare Receptionist & Appointment Management System.

---

## 🚀 One-Command Execution
You can now run both the Frontend and Backend simultaneously from the root directory:

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Run Development Mode:**
   ```bash
   npm run dev
   ```
   - **Frontend**: http://localhost:3000
   - **Backend**: http://localhost:5000

---

## 🌍 Deployment Guide

### 1. Backend & Bot (Render)
- Create a new **Web Service** on [Render](https://render.com).
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `node server.js`
- **Important**: Add all environment variables from `.env` to Render Settings.

### 2. Frontend (Netlify)
- Link your repository to **Netlify**.
- Base Directory: `frontend`
- Build Command: `npm run build`
- Publish Directory: `.next`
- **Environment Variable**: `NEXT_PUBLIC_API_URL` should be set to your **Render App URL**.

---

## 🚀 Features

- **AI Receptionist**: Telegram bot with LLM-powered intent extraction and symptom triage.
- **Admin Dashboard**: Premium Next.js portal with analytics, charts, and record management.
- **Database Architecture**: Structured PostgreSQL (Supabase) schema for doctors, patients, and appointments.
- **Automated Alerts**: Email notifications for staff when new appointments are booked.
- **Symptom Triage**: Recommends specialties based on patient descriptions (Cardiology, Dentistry, etc.).

---

## 📂 Project Structure

```bash
├── backend/            # Node.js Express Server
│   ├── services/       # AI (Gemini), DB (Supabase), Notifications
│   ├── schema.sql      # Database Migrations
│   └── server.js       # API & Telegram Bot entry
├── frontend/           # Next.js Admin Dashboard
│   ├── src/app         # App Router (Dashboard, Records, Patients)
│   └── src/components  # Professional UI Components
└── .env                # Environment Variables (See .env.example)
```

---

## 🛠️ Setup Instructions

### 1. Database Setup
- Create a project on [Supabase](https://supabase.com/).
- Run the SQL queries provided in `backend/schema.sql` in the Supabase SQL Editor.

### 2. Backend Setup
1. Navigate to the `backend` folder.
2. Create a `.env` file based on `.env.example`.
3. Provide your:
   - `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY` (Google AI Studio)
   - `TELEGRAM_BOT_TOKEN` (@BotFather)
   - `EMAIL_HOST`, `EMAIL_USER`, etc. (for Nodemailer)
4. Run `npm install`.
5. Run `node server.js` to start.

### 3. Frontend Setup
1. Navigate to the `frontend` folder.
2. Run `npm install`.
3. Run `npm run dev` to launch the dashboard at `http://localhost:3000`.

---

## 🚢 Deployment

- **Backend**: Deploy to **Render** or **Railway** (Node.js Environment).
- **Frontend**: Deploy to **Vercel** or **Netlify**.
- **Database**: Already hosted on **Supabase**.

---

## 🏛️ Professional UI Theme
The platform uses a premium healthcare design system:
- **Colors**: Sky Blue, Teal, and Slate.
- **Typography**: Inter (Modern sans-serif).
- **Aesthetics**: Glassmorphism cards, micro-animations, and responsive layouts.

---

## 📜 Medical Disclaimer
Sanjeevani AI is an administrative assistant. It provides triage recommendations based on logic but does NOT provide medical diagnosis. Always include a disclaimer for end-users.
