
# CodeMate — Competitive Programming Companion

Track upcoming contests, view tag-wise stats, practice curated problems, and manage your profile — all in one place.

## ✨ Features

* **Contest aggregator**: Codeforces, CodeChef, LeetCode (local time).
* **Stats dashboard**: Tag breakdown, totals, rating (CF/LC).
* **Practice hub**: CF filters (rating/tags/search, exclude solved by handle), curated LC/CC links.
* **Topics library**: CP topics with resources; per-topic detail pages.
* **Auth**: Signup/Login (JWT), profile & settings, change password.
* **Dark/Light mode**: Global toggle, persisted in `localStorage`.
* **Responsive UI** with modern, accessible styling.

---

## 📁 Monorepo Structure

```
CodeMate/
├─ backend/
│  ├─ prisma/
│  │  └─ schema.prisma
│  ├─ routes/
│  │  ├─ stats.js
│  │  └─ leetcodeProxy.js
│  ├─ index.js
│  ├─ package.json
│  └─ .env                  # PORT, DATABASE_URL, JWT_SECRET
│
├─ frontend/
│  ├─ src/
│  │  ├─ pages/             # Home, Dashboard, Contests, ProblemsPage, CPTopics, TopicDetail, Profile, Settings, Login, Signup, Contact
│  │  ├─ components/        # ContestCard, ProblemsWidget, etc.
│  │  └─ styles/            # *.css
│  ├─ index.html
│  ├─ vite.config.js
│  ├─ package.json
│  └─ .env                  # VITE_API_BASE
│
├─ .gitignore               # at repo root (plus subfolder .gitignores if any)
└─ README.md
```

---

## 🧰 Tech Stack

* **Frontend:** React + Vite, React Router, Recharts, react-icons, CSS modules/files
* **Backend:** Node.js, Express.js
* **Database & ORM:** MySQL, Prisma
* **Auth & Security:** JWT, bcrypt
* **3rd-party APIs:** Codeforces REST, LeetCode GraphQL (via proxy), CodeChef JSON (via proxy/dev)

---

## ✅ Prerequisites

* **Node.js** 18+ and npm
* **MySQL** 8+ running locally (or accessible remotely)

---

## 🔐 Environment Variables

### `backend/.env`

```env
# MySQL connection (adjust user/pass/db/host/port as needed)
DATABASE_URL="mysql://root:@localhost:3306/codemate"

# Express server port
PORT=5000

# JWT secret key (use a strong random string in production)
JWT_SECRET="replace_with_a_long_random_secret"
```

### `frontend/.env`

```env
# Point frontend to your backend
VITE_API_BASE="http://localhost:5000"
```

> Never commit real secrets. Keep `.env` files out of Git (root `.gitignore` covers this).

---

## 🗄️ Database Setup (Prisma + MySQL)

From **`backend/`**:

```bash
npm install
npx prisma generate
npx prisma db push
```

* `db push` creates/updates tables to match `schema.prisma`.
* If schema adds a **required** column to a non-empty table, handle it by:

  * temporarily making it optional with a default, or
  * adding defaults in schema, or
  * allowing Prisma to prompt you (avoid `--force-reset` unless you intend to drop data).

---

## ▶️ Running the App (Dev)

Open **two terminals**:

**Terminal 1 — backend**

```bash
cd backend
npx prisma db push
npx prisma generate
npm install
# optional: set "dev": "nodemon index.js" in package.json
node index.js
# or: npm run dev
# Server: http://localhost:5000
```

**Terminal 2 — frontend**

```bash
cd frontend
npm install
npm run dev
# Vite dev server: http://localhost:5173
```

Frontend calls the backend via `VITE_API_BASE`.

---

## 🔌 API Endpoints (Backend)

Base URL: `http://localhost:5000`

Auth & Profile

* `POST /api/signup` – `{ username, email, password }`
* `POST /api/login` – `{ email, password }` → `{ token, user }`
* `GET /api/me` – (Auth: `Bearer <token>`) → user profile (email, username, cfHandle, lcUsername, bio, theme, defaultPlatform, isPublic)
* `PUT /api/me` – update `{ username?, cfHandle?, lcUsername?, bio? }`
* `PUT /api/me/password` – `{ currentPassword, newPassword }`
* `PUT /api/settings` – `{ theme, defaultPlatform, isPublic }`

Stats/Proxies

* `GET /api/stats/:platform/:username` – aggregate stats

  * `platform`: `codeforces` | `leetcode`
* `POST /api/leetcode` – GraphQL proxy; body `{ query }`
* (Dev) `GET /api/codechef` – via Vite proxy / simple backend pass-through (depending on your setup)

> All `PUT/GET /api/me*` & `/api/settings` need `Authorization: Bearer <token>`.

---

## 🧭 Frontend Pages

* **Home** – navbar with dark toggle, upcoming contests highlights.
* **Dashboard** – stats tiles, tag chart, profile fetch by platform/username, practice widget, user menu (Profile/Settings/Logout), dark toggle.
* **Contests** – filters by platform, search, dark toggle & footer.
* **Problems** – CF filters (rating/tags/search/exclude solved), curated LC/CC links, dark toggle & footer.
* **Topics** – expandable cards with resources; per-topic detail pages; dark toggle & footer.
* **Profile** – view/update username/handles/bio (email is read-only).
* **Settings** – theme, default platform, public profile; change password.
* **Auth** – Login/Signup forms.
* **Contact** – team cards + dark toggle & footer.

Dark mode is applied by toggling `body.dark-mode` and persisting a boolean under `localStorage.darkMode`.

---

## 🧪 Testing (manual)

* Signup → Login → JWT stored in `localStorage.token`.
* Visit Profile/Settings while logged in; confirm fields reflect DB.
* In Dashboard, fetch CF stats for a valid handle; confirm chart & tiles.
* Problems → CF: try rating & tag filters; “Exclude solved by handle” should hide solved ones after fetching your submissions.
* Topics: open/close one card at a time; check dark mode readability.
* Contests: check CF/CC/LC lists in local time.

---

## 🛠️ Troubleshooting

* **Prisma duplicate/required column errors**

  * If you changed schema on a non-empty table, Prisma may block unsafe operations. Make the new field optional with a default, run `db push`, then back-fill and make required.
* **Windows “EPERM rename … query\_engine-windows.dll.node”**

  * Close running Node processes/VS Code terminals, delete `backend/node_modules/.prisma/client/*`, then `npm install` + `npx prisma generate`. Run terminal as Admin if needed.
* **CORS**

  * Backend should run on `PORT=5000` and set `app.use(cors())` (already present).
* **Port conflicts**

  * Change `PORT` in `backend/.env` or Vite’s port in `frontend/vite.config.js`.


## 👥 Team

* Md. Ashraful Islam — ID: 21701015 — Frontend
* Md. Mizbah Uddin — ID: 20701072 — Backend
* Robin Dey — ID: 20701011 — Database

---

## 🙏 Acknowledgements

* Codeforces API, LeetCode GraphQL, CodeChef resources
* CP-Algorithms, USACO Guide, and the creators of referenced tutorials/playlists

---

> **Tip:** Keep this README updated (screens, demo link, any API changes) so it matches the delivered code and the professor’s checklist.
