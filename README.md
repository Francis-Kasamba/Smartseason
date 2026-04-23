# 🌱 SmartSeason Field Monitoring System

SmartSeason is a full-stack web application for tracking crop progress across multiple fields during a growing season. It enables administrators and field agents to collaborate efficiently through structured field management, updates, and dashboards.


##  Quick Start

```bash
git clone <repository-url>
cd smartseason

# install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# run both services
npm run dev
````

Frontend: [https://smartseason-2-0ri5.onrender.com](https://smartseason-2-0ri5.onrender.com/login)
Backend: [https://smartseason-1-h8ek.onrender.com](https://smartseason-1-h8ek.onrender.com)

---

## 🔐 Demo Credentials

**Admin**

* Email: [admin@smartseason.com](mailto:admin@smartseason.com)
* Password: <admin-password>

**Agent**

* Email: [agent@smartseason.com](mailto:agent@smartseason.com)
* Password: <agent-password>

---

## 🧱 Tech Stack

### Frontend

* React (TypeScript)
* Vite
* Tailwind CSS
* React Router
* TanStack React Query

### Backend

* Node.js
* Express
* Supabase (Auth + PostgreSQL)
* Nodemailer (SMTP)

---

## 🏗 System Design

SmartSeason follows a modular layered architecture:

### Backend

* controllers → request/response handling
* services → business logic
* routes → API definitions
* middleware → authentication & authorization
* lib → integrations (Supabase, SMTP)

### Frontend

* pages → route-level views
* components → reusable UI
* contexts → global state
* hooks → data fetching logic

This structure ensures clear separation of concerns and maintainability.

---

## 👥 Users & Access

The system supports two roles:

### Admin (Coordinator)

* Full access to all fields
* Manage agents
* View all updates and dashboards

### Field Agent

* Access only assigned fields
* Update field stages
* Add observations

Authentication is handled via Supabase, with backend token verification and role-based route protection.

---

## 🌾 Field Management

Admins can:

* Create fields
* Update fields
* Delete fields
* Assign fields to agents

Each field contains:

* Name
* Crop type
* Planting date
* Current stage
* Assigned agent

---

## 🔄 Field Updates

### Field Agents

* Update field stage
* Add notes/observations

### Admins

* View all updates across all fields
* Monitor agent activity

---

## 🌱 Field Stages

Fields follow this lifecycle:

* Planted
* Growing
* Ready
* Harvested

Stage updates are validated and tracked in the system.

---

## ⚠️ Field Status Logic

Each field has a computed status:

### Status Types

* **Active**
* **At Risk**
* **Completed**

### Logic

* **Completed**

  * Field stage = `harvested`

* **Active**

  * Field is in `planted`, `growing`, or `ready`
  * AND has been updated recently

* **At Risk**

  * Field is not harvested
  * AND has not been updated for a defined period (e.g., several days)

This logic helps identify neglected or delayed fields.

---

## 📊 Dashboard

### Admin Dashboard

* Total number of fields
* Status breakdown (Active / At Risk / Completed)
* Recent activity across agents

### Agent Dashboard

* Assigned fields
* Field progress
* Personal activity overview

---

## ⏱ Observation Edit Rule

Observations can only be edited if:

* The user is the creator OR an admin
* The observation is less than 15 minutes old

This rule is enforced on the backend.

---

## ⚙️ Environment Setup

### Backend (`backend/.env`)

```env
SUPABASE_URL=your-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

PORT=3001
FRONTEND_URL=http://localhost:5174

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-app-password
SMTP_FROM="SmartSeason <your-email>"
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3001
```

---

## 🗄 Database

Uses PostgreSQL via Supabase.

Core tables:

* profiles (users + roles)
* fields
* field_updates

Includes:

* relational integrity
* indexes for performance
* triggers for timestamps

---

## 📡 API Overview

### Auth

* POST /api/auth/login
* GET /api/auth/me
* POST /api/auth/logout

### Fields

* GET /api/fields
* POST /api/fields (admin)
* GET /api/fields/:id
* PUT /api/fields/:id (admin)
* DELETE /api/fields/:id (admin)

### Updates

* POST /api/fields/:id/updates
* GET /api/fields/:id/updates

### Users (Admin)

* GET /api/users
* POST /api/users
* PUT /api/users/:id
* DELETE /api/users/:id

---

## 📧 Agent Onboarding

When an admin creates an agent:

* Account is created
* Temporary password is assigned
* Email is sent via SMTP
* Agent must reset password on first login

---

## ⚠️ Assumptions

* Users are limited to Admins and Field Agents
* Fields are assigned to one agent at a time
* Field status is derived from stage and update activity
* SMTP credentials are valid and configured
* Application is used in a modern browser

---

## 🛠 Troubleshooting

### Login Issues

* Verify credentials
* Ensure user exists in Supabase

### Backend Errors

* Check environment variables
* Confirm Supabase keys

### Email Not Sending

* Verify SMTP credentials
* Use Gmail app password
* Check spam folder

---

## 🔒 Security Notes

* Environment variables are not committed
* Service role key is backend-only
* Token validation is enforced on protected routes
* Role-based access is strictly applied

---

## 📜 Scripts

### Root

```bash
npm run dev
npm run dev:backend
npm run dev:frontend
```

### Backend

```bash
npm run dev
npm run start
```

### Frontend

```bash
npm run dev
npm run build
```

---

