# Taskora

**Make space for what matters.**

A full-stack task manager with a calm, premium feel: priority colours you can read at a glance, a dashboard, calendar, analytics, and dark mode.

| Layer | Tech |
|---|---|
| Frontend | React 18 (Vite), Tailwind CSS, Framer Motion, Lucide icons, Recharts |
| Backend | Python Flask, Flask-SQLAlchemy, Flask-JWT-Extended |
| Database | SQLite |

## Features

- **Accounts**: register, sign in, sign out. Passwords are hashed; every task belongs to one user and every query is filtered by the logged-in user's id.
- **Tasks**: create, edit, delete, complete and reopen, with title, description, due date, priority, category and tags.
- **Views**: Dashboard, My Day, All Tasks, Upcoming, Completed, Overdue, with priority and status filters and live search.
- **Calendar**: month view, deadlines coloured by priority, click a day to see (and add) its tasks.
- **Analytics**: weekly completions, priority distribution, completed vs pending, productivity score.
- **Polish**: toasts, delete confirmations, loading skeletons, empty-state illustrations, responsive sidebar, dark mode, notification bell.

Priority colours are used the same way everywhere: **red = high, orange = medium, green = low**.

## Run it

You need **Python 3.10+** and **Node.js 18+**. Open two terminals.

**1. Backend** (http://127.0.0.1:5000)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The SQLite database is created automatically in `backend/instance/`.
Optional: `python seed.py` adds a demo account (`demo@taskora.app` / `Taskora123`) with sample tasks, handy for screenshots.

**2. Frontend** (http://localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and create an account. In development, Vite forwards `/api` requests to Flask, so there is nothing to configure.

## Run the tests

```bash
cd backend
python -m unittest test_api -v
```

The tests cover registration, login, validation, task CRUD, completion, stats, and that one user can never read or change another user's tasks.

## Project structure

```
taskora/
├── backend/
│   ├── app.py            # app factory, error handlers
│   ├── config.py         # settings (env vars override)
│   ├── extensions.py     # db, jwt, cors objects
│   ├── models.py         # User, Task
│   ├── validation.py     # input checks
│   ├── routes/
│   │   ├── auth.py       # register, login, profile, password
│   │   ├── tasks.py      # task CRUD + toggle
│   │   └── stats.py      # dashboard and analytics numbers
│   ├── seed.py           # optional demo data
│   ├── test_api.py
│   └── requirements.txt
└── frontend/
    ├── package.json
    └── src/
        ├── lib/          # api.js (all fetch calls), utils.js (dates, priority styles)
        ├── context/      # Auth, Tasks, Theme, Toast
        ├── components/   # Sidebar, Topbar, TaskCard, TaskModal, ...
        └── pages/        # Dashboard, TaskList, CalendarPage, Analytics, Settings, AuthPage
```

## API

All routes except register and login need the header `Authorization: Bearer <token>`.

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account, returns token |
| POST | `/api/auth/login` | Sign in, returns token |
| GET / PATCH | `/api/auth/me` | Get or update profile |
| POST | `/api/auth/password` | Change password |
| GET | `/api/tasks` | List tasks (`q`, `priority`, `status`, `category` filters) |
| POST | `/api/tasks` | Create a task |
| GET / PUT / DELETE | `/api/tasks/<id>` | Read, update, delete |
| PATCH | `/api/tasks/<id>/toggle` | Complete or reopen |
| GET | `/api/stats` | Numbers for dashboard and analytics |

## Design notes

- **Colours** live as CSS variables in `frontend/src/index.css`; dark mode just swaps the variables.
- **Fonts**: Bricolage Grotesque (headings) and Figtree (text), loaded from Google Fonts in `index.html`.
- **Dates** are plain `YYYY-MM-DD` strings in the user's local time. The browser sends its own "today" to the API, so Overdue and My Day are correct in every timezone.
- **Productivity score** = share of completed tasks that were finished on or before their due date.

## Before deploying

- Set a long random `JWT_SECRET_KEY` environment variable (the default is for development only).
- Set `CORS_ORIGINS` to your site's address, and serve with a production server such as gunicorn instead of `python app.py`.
- Run `npm run build` and serve `frontend/dist`, forwarding `/api` to Flask (or set `VITE_API_URL` before building).
