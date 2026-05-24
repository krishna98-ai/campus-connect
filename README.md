# 🎓 Campus Connect

**A full-stack, real-time college community platform** — built with the MERN stack, Socket.IO, Redux Toolkit, and Tailwind CSS.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-6366f1?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | JWT + HTTP-only cookies, refresh persistence, forgot/reset password |
| 📝 **Social Feed** | Create/edit/delete posts, likes, nested comments, image uploads |
| 📚 **Study Notes** | Upload PDF/images, categorize, search, download with Cloudinary |
| 💬 **Real-time Chat** | One-to-one messaging, typing indicators, online presence via Socket.IO |
| 🔔 **Notifications** | Real-time push notifications for likes, comments, follows |
| 🔍 **Explore** | Full-text search across posts, notes, and users |
| 👤 **Profiles** | Follow/unfollow, user stats, activity feed |
| 🛡️ **Admin Panel** | User management, content moderation, analytics dashboard |
| 🌙 **Dark Mode** | System-aware, persistent preference |

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)
- Cloudinary account (free tier works)
- Gmail account for Nodemailer (or any SMTP)

### 1. Clone and install

```bash
# Clone
git clone https://github.com/yourname/campus-connect.git
cd campus-connect

# Install backend
cd backend && npm install

# Install frontend
cd ../frontend && npm install
```

### 2. Configure environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Frontend (optional — Vite proxy works for local dev)
cp frontend/.env.example frontend/.env
```

**Required backend `.env` values:**

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/campus-connect
JWT_SECRET=your_32_char_secret_here
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=you@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@campusconnect.com
FROM_NAME=Campus Connect
```

### 3. Run development servers

```bash
# Terminal 1 — Backend (from /backend)
npm run dev

# Terminal 2 — Frontend (from /frontend)
npm run dev
```

Open **http://localhost:5173**

---

## 🐳 Docker (Recommended for Production)

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env

# Build and start all services
docker compose up --build -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

Services:
- **Frontend** → http://localhost (port 80)
- **Backend** → http://localhost:5000
- **MongoDB** → localhost:27017

---

## 🗂 Project Structure

```
campus-connect/
├── backend/
│   ├── config/          # DB, Cloudinary config
│   ├── controllers/     # Business logic
│   ├── middleware/       # Auth, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── services/        # Email service
│   ├── socket/          # Socket.IO setup
│   └── utils/           # JWT, API response helpers
│
├── frontend/
│   └── src/
│       ├── api/         # Axios instance
│       ├── components/  # Reusable UI components
│       ├── hooks/       # Custom React hooks
│       ├── layouts/     # Page layouts
│       ├── pages/       # Route pages
│       ├── routes/      # Route config + guards
│       ├── socket/      # Socket.IO client
│       ├── store/       # Redux slices
│       └── utils/       # Helper functions
│
├── docker-compose.yml
└── README.md
```

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout (clears cookie) |
| GET  | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Send reset email |
| PUT  | `/api/auth/reset-password/:token` | Reset password |
| PUT  | `/api/auth/update-password` | Change password |
| PUT  | `/api/auth/update-profile` | Update profile + avatar |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/posts` | Feed (paginated, filterable) |
| POST | `/api/posts` | Create post (multipart) |
| GET  | `/api/posts/trending` | Trending posts |
| GET  | `/api/posts/:id` | Single post |
| PUT  | `/api/posts/:id` | Edit post |
| DELETE | `/api/posts/:id` | Delete post |
| PUT  | `/api/posts/:id/like` | Toggle like |
| PUT  | `/api/posts/:id/save` | Toggle save |
| POST | `/api/posts/:id/comments` | Add comment |
| DELETE | `/api/posts/:id/comments/:cId` | Delete comment |
| POST | `/api/posts/:id/comments/:cId/replies` | Add reply |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/notes` | List notes (filterable) |
| POST | `/api/notes` | Upload note (multipart) |
| GET  | `/api/notes/:id` | Single note |
| PUT  | `/api/notes/:id` | Edit note |
| DELETE | `/api/notes/:id` | Delete note |
| PUT  | `/api/notes/:id/download` | Track download |
| PUT  | `/api/notes/:id/like` | Toggle like |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/conversations` | Get/create conversation |
| GET  | `/api/chat/conversations` | List conversations |
| GET  | `/api/chat/conversations/:id/messages` | Get messages |
| POST | `/api/chat/conversations/:id/messages` | Send message |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/users/search?q=` | Search users |
| GET  | `/api/users/suggestions` | Suggested users |
| GET  | `/api/users/:username` | User profile |
| GET  | `/api/users/:username/posts` | User's posts |
| PUT  | `/api/users/:id/follow` | Follow/unfollow |

---

## ☁️ Deployment

### Backend → Render
1. New Web Service → connect GitHub repo
2. Root directory: `backend`
3. Build: `npm install`
4. Start: `npm start`
5. Add all env vars from `.env.example`

### Frontend → Vercel
1. Import project → root directory: `frontend`
2. Framework: Vite
3. Set env vars:
   - `VITE_API_URL` = `https://your-render-backend.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://your-render-backend.onrender.com`

### MongoDB → Atlas
1. Create free M0 cluster at mongodb.com/atlas
2. Whitelist IP `0.0.0.0/0` (or Render's IPs)
3. Create DB user, copy connection string to `MONGODB_URI`

---

## 🔒 Security Features

- JWT in HTTP-only cookies (XSS-safe)
- bcrypt password hashing (rounds: 12)
- Rate limiting (200 req/15min global, 20 req/hr on auth)
- MongoDB query sanitization
- Helmet.js security headers
- CORS with credentials
- Input validation via express-validator
- Admin role-based access control

---

## 🧪 Demo Credentials

After seeding or first signup, create an admin by updating role in MongoDB:

```js
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

---

## 📄 License

MIT © Campus Connect
