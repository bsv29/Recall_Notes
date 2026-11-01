# Recall

A revision app for 20 courses (Python, Java, JavaScript, SQL, React, Tailwind CSS, Java Full Stack,
Python Full Stack, NumPy, Pandas, Matplotlib, Seaborn, scikit-learn, Machine Learning, Deep Learning,
PyTorch, NLP, Transformers, LLMs, RAG) with notes, cheat sheets, spaced-repetition flashcards,
mock interviews, quizzes and timed coding challenges. Users can also add their own courses.

There is **no Claude or other AI connector**. All study content ships with the frontend, and
accounts and progress are handled by this project's own FastAPI backend and database.

## Course content

Every topic has quick notes, a diagram, a cheat card, flashcards, interview questions, a quiz and
practical challenges. **Python** also has full scratch-to-advanced lessons (12 levels, about 8,400
words, 79 worked examples with their real output). Lessons for the other courses follow the same
format: add a `doc` array to a topic (see `frontend/src/data/python-lessons-1.js` for the block types).

## Folder structure

```
recall/
├── README.md
├── docker-compose.yml          # PostgreSQL + backend + frontend in one command
├── .gitignore
├── backend/                    # FastAPI + SQLAlchemy + JWT
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example            # copy to .env
│   ├── app/
│   │   ├── main.py             # app, CORS, body-size limit, routers
│   │   ├── config.py           # settings from environment variables
│   │   ├── database.py         # engine, session, Base
│   │   ├── models.py           # User, UserData tables
│   │   ├── schemas.py          # Pydantic request/response models
│   │   ├── security.py         # bcrypt hashing, JWT creation, current_user
│   │   └── routers/
│   │       ├── auth.py         # register, login, me, change password, delete
│   │       └── data.py         # get / save a user's progress and courses
│   └── tests/
│       ├── conftest.py
│       └── test_api.py         # 7 API tests (pytest)
└── frontend/                   # React 19 + Vite, icons from @mui/icons-material
    ├── Dockerfile              # npm build, then Nginx serves dist/
    ├── index.html
    ├── package.json
    ├── vite.config.js          # dev server on port 5500
    └── src/
        ├── main.jsx            # mounts <App />
        ├── App.jsx             # boot, auth gate, page routing, global keyboard shortcuts
        ├── config.js           # API_URL from VITE_API_URL
        ├── styles.css          # themes (light/dark, 4 accents), layout, components
        ├── data/               # all course content (plain ES modules)
        │   ├── index.js                # imports every course in the right order
        │   ├── python.js               # Python quick notes, cards, quiz
        │   ├── python-lessons-1/2/3.js # full Python lessons, scratch to advanced
        │   ├── numpy-pandas.js, pytorch.js, java-js-react-tailwind.js,
        │   ├── sql-fullstack-viz.js, sklearn-ml-dl-nlp.js, transformers-llm-rag.js
        │   └── practicals.js           # hand-written bug / ordering challenges
        ├── lib/
        │   ├── store.js        # state, API client, sync, spaced repetition, XP, badges, navigation
        │   ├── courses.js      # built-in courses, formats, auto-generated practicals
        │   └── text.js         # formatting, syntax highlighting, date helpers
        ├── components/
        │   ├── icons.jsx       # every MUI icon the app uses, by name
        │   ├── common.jsx      # pills, meters, crumbs, code blocks, cheat cards, options
        │   ├── Shell.jsx       # sidebar, top bar, search
        │   ├── Overlay.jsx     # toasts, confirm and level-up modals
        │   ├── TopicParts.jsx  # diagrams, lessons, checkpoints, level path
        │   └── sessions/       # CardSession, QuizSession, ArenaSession, InterviewSession
        └── pages/              # Auth, Dashboard, Library, Topic, Study, ModePage, Settings, Wizard
```

## Run locally (without Docker)

**1. Backend** (Python 3.11+):

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # Windows: copy .env.example .env
# edit .env and set JWT_SECRET to a long random string
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

**2. Frontend** (Node.js 20+):

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5500, create an account, and start studying.
`npm run build` writes a production build to `frontend/dist/`.

**3. Tests:**

```bash
cd backend
pytest -q
```

## Run everything with Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:8080
- API: http://localhost:8000 (docs at /docs)
- Data lives in PostgreSQL in the `pgdata` volume.

Set a real secret first: `JWT_SECRET=$(python -c "import secrets; print(secrets.token_urlsafe(48))") docker compose up --build`

## API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | – | Health check |
| POST | `/api/auth/register` | – | Create an account → `{token, user}` |
| POST | `/api/auth/login` | – | Sign in → `{token, user}` |
| GET | `/api/auth/me` | Bearer | Current user |
| PATCH | `/api/auth/me` | Bearer | Change name |
| POST | `/api/auth/change-password` | Bearer | Change password |
| DELETE | `/api/auth/me` | Bearer | Delete account and all data |
| GET | `/api/data` | Bearer | Load progress, custom courses and notes |
| PUT | `/api/data` | Bearer | Save progress, custom courses and notes |

Passwords are hashed with bcrypt. Tokens are JWTs (HS256) that expire after `JWT_EXPIRE_DAYS`.

## Deploy

| Part | Suggested host | Notes |
|---|---|---|
| Database | Neon, Supabase or Render PostgreSQL | Copy the connection string into `DATABASE_URL` as `postgresql+psycopg://...` |
| Backend | Render, Railway or Fly.io | Use the `backend/Dockerfile`. Set `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS` (your frontend URL) |
| Frontend | Netlify, Vercel or GitHub Pages | Build command `npm run build`, publish `frontend/dist`. Set `VITE_API_URL` to your backend URL at build time |

## How saving works

Every change is cached in the browser immediately and sent to the backend about a second later
(and when the tab closes or goes to the background). If the server is unreachable, the app keeps
working from the cache and syncs when the connection returns. Users can also download a backup file
from **Settings → Backup**.

## Ideas for next steps

- Move course content into the database with an admin panel to edit it.
- Add Google sign-in (OAuth) alongside email and password.
- Add Alembic migrations before changing the database schema.
- Lazy-load course content per course to shrink the initial bundle.
