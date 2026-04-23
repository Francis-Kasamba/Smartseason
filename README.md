# SmartSeason

SmartSeason is a full-stack field management platform designed for agricultural operations. It enables admins and agents to manage fields, track lifecycle progress, and log observations efficiently.


##  Quick Start

```bash
git clone <repository-url>
cd smartseason

# install root dependencies
npm install

# install backend and frontend
cd backend && npm install
cd ../frontend && npm install

# run both apps (from root)
npm run dev
````

Open the application at:
[http://localhost:5174](http://localhost:5174)

---

## 1. Tech Stack

### Frontend

* React (latest stable)
* TypeScript
* Vite
* Tailwind CSS
* React Router
* TanStack React Query
* Radix UI

### Backend

* Node.js
* Express 5
* Supabase (Auth + PostgreSQL)
* Nodemailer (SMTP)

---

## 2. Project Structure

```text
smartseason/
  backend/            # Express API + Supabase integration
  frontend/           # React application
  package.json        # Root scripts
```

---

## 3. Architecture

SmartSeason follows a modular layered architecture focused on clarity and maintainability.

### Backend

* controllers → handle HTTP logic
* services → business logic
* routes → API definitions
* middleware → auth and validation
* lib → integrations (Supabase, SMTP)

### Frontend

* pages → route-level views
* components → reusable UI
* contexts → global state (auth, toast)
* hooks → logic and data fetching
* lib → API utilities

---

## 4. Core Features

### Authentication and Access Control

* Supabase email/password login
* Backend token verification
* Role-based access (admin, agent)
* Protected routes

### Agent Management

* Full CRUD (admin only)
* SMTP invite emails
* Temporary passwords
* Forced password reset on first login

### Field Management

* Admin CRUD operations
* Field assignment to agents
* Lifecycle tracking:

  * planted → growing → ready → harvested

### Observations

* Agents can log updates and notes
* Edits allowed only within 15 minutes
* Rule enforced on backend

### Dashboards

* Admin: system-wide stats and activity
* Agent: assigned fields and progress

### UI/UX

* Responsive layout
* Collapsible sidebar
* Mobile drawer navigation
* Toast notifications
* Error boundary and 404 page

---

## 5. Routing Behavior

* `/` → redirects to `/login`
* `/login` → public page
* `/admin/*` → admin routes
* `/agent/*` → authenticated routes
* unknown routes → 404 page

---

## 6. Environment Configuration

### Backend (backend/.env)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

FRONTEND_URL=http://localhost:5174
PORT=3001

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="SmartSeason <your-gmail@gmail.com>"
```

### Frontend (frontend/.env)

```env
VITE_API_URL=http://localhost:3001
```

---

## 7. Database Schema (Supabase SQL)

Run the provided SQL schema in Supabase to create:

* profiles
* fields
* field_updates
* triggers and indexes

### Default Admin

The user with email:

```
admin@smartseason.com
```

is automatically assigned the admin role.

---

## 8. Installation and Running

### Prerequisites

* Node.js (v16+)
* npm (v7+)
* Supabase account

### Steps

1. Clone repository
2. Install dependencies
3. Configure environment variables
4. Run development servers

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

---

## 9. Authentication and Password Reset Flow

### Login

* Frontend → POST /api/auth/login
* Backend authenticates via Supabase
* Returns user + token

### First Login Reset (Agents)

* Admin creates agent with temporary password
* `must_reset_password = true`
* Access blocked until reset
* Endpoint:

  ```
  POST /api/auth/reset-password-first-login
  ```
* After reset → access granted

---

## 10. Observation Edit Rule (15 Minutes)

Edits are allowed only when:

* The update is a note
* The user is the owner or admin
* The note is less than 15 minutes old

This rule is enforced on the backend.

---

## 11. API Summary

### Auth

* POST /api/auth/login
* POST /api/auth/reset-password-first-login
* POST /api/auth/logout
* GET /api/auth/me

### Dashboard

* GET /api/dashboard

### Fields

* GET /api/fields
* POST /api/fields (admin)
* GET /api/fields/:id
* PUT /api/fields/:id (admin)
* DELETE /api/fields/:id (admin)
* PATCH /api/fields/:id/stage
* GET /api/fields/:id/updates
* POST /api/fields/:id/updates
* PATCH /api/fields/:id/updates/:updateId

### Agents (Admin)

* GET /api/users
* POST /api/users
* PUT /api/users/:id
* DELETE /api/users/:id

---

## 12. SMTP Invite Behavior

When an admin creates an agent:

* Account is created or synced
* Temporary password is generated
* must_reset_password = true
* Invite email is sent

If email fails:

* Account still created
* API returns warning

---

## 13. Troubleshooting

### Invalid Credentials

* Verify user in Supabase
* Check password
* Confirm email verification

### Server Errors

* Check backend .env values
* Validate service role key

### SMTP Issues

* Verify credentials
* Use Gmail app password
* Check spam folder

### Dashboard Access Issues

* Ensure profile exists
* Run schema and triggers
* Check must_reset_password flag

---

## 14. Security Notes

* Do not commit .env files
* Keep service role key private
* Rotate compromised keys
* Use HTTPS in production

---

## 15. Scripts

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
npm run seed
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
```

---

## 16. Assumptions

* Users are admins and agents
* Supabase handles authentication and database
* SMTP is externally configured
* Modern browsers are used

---

## 17. Design Philosophy

SmartSeason emphasizes:

* Clear separation of concerns
* Backend-enforced business rules
* Maintainable and scalable structure
* Practical over complex architecture
