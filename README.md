# Sanjeevani AI 🏥
**AI-Powered Healthcare Appointment & Clinic Assistant**

Sanjeevani AI is a production-quality SaaS platform designed as an intelligent AI receptionist for hospitals and clinics. It interacts with patients via Telegram, triages symptoms using Gemini AI, and provides a powerful admin dashboard for clinic management.
# Sanjeevani AI v2.0 🩺
AI-Powered Healthcare Receptionist & Appointment Management System.

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



---

## 🏛️ Professional UI Theme
The platform uses a premium healthcare design system:
- **Colors**: Sky Blue, Teal, and Slate.
- **Typography**: Inter (Modern sans-serif).
- **Aesthetics**: Glassmorphism cards, micro-animations, and responsive layouts.

---

## 📜 Medical Disclaimer
Sanjeevani AI is an administrative assistant. It provides triage recommendations based on logic but does NOT provide medical diagnosis. Always include a disclaimer for end-users.
