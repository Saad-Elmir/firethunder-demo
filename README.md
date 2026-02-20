# FireThunder Demo — Fullstack (Backend + Frontend)

A demo fullstack app with:
- GraphQL backend (Auth + Products CRUD)
- React frontend (MUI, i18n EN/FR, Toasts)
- Unit & component tests with Vitest + Testing Library

---

## 1. Prerequisites

Make sure you have:
- **Git**
- **Docker** + **Docker Compose**
- **Node.js** (recommended **18+ or 20+**) + **npm**
- **Python** for FastAPI

---

## 2. Clone the repository

```bash
git clone https://github.com/Saad-Elmir/firethunder-demo
cd firethunder-demo
```

---

## 3. Start the Database (Docker)

The backend uses **Postgres**. The easiest way to get started is via Docker.

```bash
# Start the database in the background
docker compose up -d

# Check container status
docker compose ps

# Stop and remove containers
docker compose down

---

```

## 4. Backend — Run the API

---

###  Run Locally (Python)

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv

# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --host 127.0.0.1 --port 8000

```

 **GraphQL Endpoint:** `http://127.0.0.1:8000/graphql`

---

## 5. Frontend — Run the UI

```bash
cd frontend
npm install
npm run dev

```

 **Frontend URL:** `http://127.0.0.1:5173`

---

## 6. Run Frontend Tests (Vitest)

The project utilizes `vitest`, `@testing-library/react`, and `jsdom` for unit and integration testing.

```bash
cd frontend
npm run test

```

---

## 7. Sample Credentials

Use these credentials for the local development database:

| Role | Username | Password |
| --- | --- | --- |
| **Admin** | `admin` | `Admin12345!` |
| **User** | `Test1` | `Test123` |

> [!IMPORTANT]
> If you created the admin manually in Postgres, ensure the bcrypt hash matches the password provided above.

---

## 8. Notes & Behavior

### 🔐 Authentication

* **Storage:** The JWT is stored in `localStorage` under the key: `token`.
* **Session:** On a `401 Unauthorized` response, the app automatically clears the token and redirects to `/login`.

### Internationalization (i18n)

* **Languages:** English (default) and French.
* **Persistence:** Preference is saved in `localStorage` (key: `lang`).
* **Files:** Located in `frontend/src/i18n/`.

### Theme (Light/Dark)

* Preference is stored in `localStorage` (key: `theme`).
* Toggle is located in the **AppBar**.
* The theme persists globally across sessions.

---

## 9. Troubleshooting

* **"localhost refused to connect":** Ensure the backend server is active and Docker containers are running. Check the URL in `frontend/src/apollo/client.ts`.
* **Login Failures:** * Verify the backend is up (Network Error vs. Logic Error).
* Check that your database contains the correct user records.
* If you clear the token manually, you must have the backend running to re-authenticate.



---

## 10. Quick Start Summary

1. **Start DB:** `docker compose up -d`
2. **Start Backend:** `cd backend && uvicorn main:app --reload`
3. **Start Frontend:** `cd frontend && npm run dev`
4. **Run Tests:** `cd frontend && npm run test`

---


